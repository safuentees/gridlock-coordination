"""Two streamed source passes retain every candidate and its native geometry helpers."""
from functools import lru_cache
import json
from pathlib import Path
import sqlite3
import osmium
from common import TYPES, TAGS, canonical, digest, read, write, sha_file
from intake import verify_original


def connect(path, readonly=False):
    db = sqlite3.connect(f'file:{Path(path).resolve()}?mode=ro', uri=True) if readonly else sqlite3.connect(path)
    db.execute('PRAGMA cache_size=-16384')
    db.execute('PRAGMA temp_store=FILE')
    return db


def enumerate_extract(plan, extract, originals, work):
    folder = Path(work) / extract['id']
    folder.mkdir(exist_ok=True)
    marker = folder / 'enumerated.json'
    original = Path(originals) / extract['url'].rsplit('/', 1)[-1]
    receipt = verify_original(extract, original, plan['snapshotAsOf'])
    if marker.exists():
        previous = read(marker)
        if previous['planSha256'] == digest(plan) and previous['originalSha256'] == receipt['sha256'] and sha_file(folder / 'raw.sqlite') == previous['databaseSha256']:
            return
        raise RuntimeError('Enumeration checkpoint changed; retain it and use a new work directory.')
    # Only this producer's interrupted, uncommitted intermediates are recreated.
    for name in ('raw.sqlite', 'raw.sqlite-journal', 'helpers.osm.pbf'):
        (folder / name).unlink(missing_ok=True)
    db = connect(folder / 'raw.sqlite')
    db.executescript('''
      CREATE TABLE candidates(type TEXT, id TEXT, PRIMARY KEY(type,id));
      CREATE TABLE objects(type TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(type,id));
      CREATE TABLE occurrences(type TEXT,id TEXT,version INTEGER,timestamp TEXT,content_sha TEXT,PRIMARY KEY(type,id));
    ''')
    pool = osmium.io.ThreadPool(plan['resources']['threads'], 2)
    count = 0
    with osmium.BackReferenceWriter(str(folder / 'helpers.osm.pbf'), ref_src=str(original),
                                   remove_tags=False, relation_depth=plan['resources']['relationDepth'], thread_pool=pool) as writer:
        processor = osmium.FileProcessor(str(original), thread_pool=pool).with_filter(osmium.filter.KeyFilter('power'))
        for obj in processor:
            if obj.tags.get('power') != 'substation':
                continue
            db.execute('INSERT INTO candidates VALUES (?,?)', (TYPES[obj.type_str()], str(obj.id)))
            writer.add(obj)
            count += 1
            if count % 10000 == 0:
                db.commit()
    db.commit()
    objects = 0
    for obj in osmium.FileProcessor(str(folder / 'helpers.osm.pbf'), thread_pool=pool):
        kind, native_id = TYPES[obj.type_str()], str(obj.id)
        tags = {key: obj.tags[key].strip() for key in (*TAGS, 'type', 'area') if key in obj.tags and obj.tags[key].strip()}
        payload = {'type': kind, 'id': native_id, 'tags': tags, 'deleted': bool(obj.deleted)}
        if kind == 'node':
            payload['positionE7'] = [obj.location.x, obj.location.y] if obj.location.valid() else None
        elif kind == 'way':
            payload['nodes'] = [str(n.ref) for n in obj.nodes]
        else:
            payload['members'] = [{'type': TYPES[m.type], 'id': str(m.ref), 'role': m.role} for m in obj.members]
        db.execute('INSERT INTO objects VALUES (?,?,?)', (kind, native_id, canonical(payload).decode()))
        if db.execute('SELECT 1 FROM candidates WHERE type=? AND id=?', (kind, native_id)).fetchone():
            timestamp = obj.timestamp.isoformat().replace('+00:00', 'Z')
            if obj.version < 1 or not timestamp.endswith('Z'):
                raise RuntimeError('Candidate lacks a C2-compatible native version/timestamp; enumeration remains pending.')
            db.execute('INSERT INTO occurrences VALUES (?,?,?,?,NULL)', (kind, native_id, obj.version, timestamp))
        objects += 1
        if objects % 10000 == 0:
            db.commit()
    db.commit()
    if db.execute('SELECT COUNT(*) FROM occurrences').fetchone()[0] != count:
        raise RuntimeError('Filtered helper pass did not retain all primary candidates; enumeration remains pending.')
    store = Store(db)
    for kind, native_id in db.execute('SELECT type,id FROM candidates ORDER BY type, CAST(id AS INTEGER)').fetchall():
        obj = store.get(kind, native_id)
        content = {'tags': {k: obj['tags'][k] for k in TAGS if k in obj['tags']},
                   'nativeGeometry': store.geometry_payload(kind, native_id)}
        db.execute('UPDATE occurrences SET content_sha=? WHERE type=? AND id=?', (digest(content), kind, native_id))
    db.commit()
    db.close()
    write(marker, {'planSha256': digest(plan), 'originalSha256': receipt['sha256'], 'bytes': receipt['bytes'],
                   'snapshotAsOf': receipt['snapshotAsOf'], 'databaseSha256': sha_file(folder / 'raw.sqlite'),
                   'candidateOccurrences': count, 'helperOccurrences': objects - count,
                   'filteredBytes': (folder / 'helpers.osm.pbf').stat().st_size})


class Store:
    def __init__(self, db):
        self.db = db

    @lru_cache(maxsize=16384)
    def get(self, kind, native_id):
        row = self.db.execute('SELECT payload FROM objects WHERE type=? AND id=?', (kind, native_id)).fetchone()
        return json.loads(row[0]) if row else None

    def geometry_payload(self, kind, native_id, ancestors=()):
        identity = (kind, native_id)
        if identity in ancestors or len(ancestors) > 10:
            return {'unresolved': 'cycle-or-depth-limit', 'identity': identity}
        obj = self.get(kind, native_id)
        if obj is None:
            return {'missing': identity}
        shape = {k: v for k, v in obj.items() if k != 'tags'}
        shape['areaSemantics'] = {k: obj['tags'][k] for k in ('area', 'type') if k in obj['tags']}
        if kind == 'way':
            shape['nodeGeometry'] = [self.geometry_payload('node', n, ancestors + (identity,)) for n in obj['nodes']]
        if kind == 'relation':
            shape['memberGeometry'] = [self.geometry_payload(m['type'], m['id'], ancestors + (identity,)) for m in obj['members']]
        return shape
