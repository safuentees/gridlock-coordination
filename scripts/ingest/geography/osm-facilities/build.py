"""Resumable geometry results, full identity ledger, and C2 generation gate."""
import json
import os
from pathlib import Path
import subprocess
from common import HERE, TAGS, citation, digest, read, write, sha_file, utc
from enumerate import connect, Store
from geometry import build_geometry, UnsupportedGeometry
from census import CensusContext

LIMITATIONS = [
    'Community-mapped substation references are unverified and do not establish project identity, ownership, engineering accuracy or construction status.',
    'Native node positions, native footprints and component extents have different meanings; no derived facility center is supplied.',
    'Ambiguous, cross-boundary and outside-supported context cannot establish a unique project state.',
    'Different OSM identities may represent overlapping physical facilities; they remain separate native records.',
    'Only literal power=substation is enumerated; prefix-only lifecycle tags, legacy power=station and untagged facilities are outside this finite tag scope.',
    'Pending public download offer blocks public distribution; no reference is activated in the existing application.',
]


def producer_digest():
    return digest({p.name: sha_file(p) for p in sorted(HERE.iterdir()) if p.suffix in ('.py', '.mts', '.json')})


def build(plan, originals, census_originals, work, schema_root, node, tsx, limit=None):
    work = Path(work)
    census = CensusContext(plan, census_originals, work)
    use = read(HERE / 'source-use.json')
    extracts, stores, entries = [], {}, {}
    for extract in plan['extracts']:
        folder = work / extract['id']
        marker = folder / 'enumerated.json'
        if not marker.exists():
            original = Path(originals) / extract['url'].rsplit('/', 1)[-1]
            reason = 'Original acquired; complete native enumeration is pending.' if original.exists() else 'Frozen PBF original has not been acquired and hash-verified.'
            extracts.append({'status': 'pending', 'id': extract['id'], 'source': citation(extract), 'reason': reason})
            continue
        metadata = read(marker)
        if metadata['planSha256'] != digest(plan) or metadata['databaseSha256'] != sha_file(folder / 'raw.sqlite'):
            raise RuntimeError('Enumeration checkpoint hash/plan mismatch: ' + extract['id'])
        db = connect(folder / 'raw.sqlite', readonly=True)
        stores[extract['id']] = Store(db)
        extracts.append({'status': 'acquired', 'id': extract['id'], 'source': citation(extract),
                         'snapshotAsOf': metadata['snapshotAsOf'], 'sha256': metadata['originalSha256'],
                         'bytes': metadata['bytes'], 'candidateOccurrences': metadata['candidateOccurrences'],
                         'helperOccurrences': metadata['helperOccurrences']})
        for kind, native_id, version, timestamp, content_hash in db.execute('SELECT * FROM occurrences ORDER BY type, CAST(id AS INTEGER)'):
            key = (kind, native_id)
            entry = entries.setdefault(key, {'native': {'type': kind, 'id': native_id}, 'occurrences': [],
                                            'disposition': 'pending', 'reason': 'Geometry processing has not completed.', 'referenceId': None})
            entry['occurrences'].append({'extractId': extract['id'], 'version': version, 'timestamp': timestamp, 'contentSha256': content_hash})
    if not stores:
        write(work / 'pending.json', {'status': 'pending-acquisition-or-enumeration', 'counts': None, 'extracts': extracts,
                                      'reason': 'Missing source inventory is unknown, not a zero-record completed asset.'})
        return
    results = connect(work / 'results.sqlite')
    results.execute('CREATE TABLE IF NOT EXISTS results(identity TEXT PRIMARY KEY, input_sha TEXT, payload TEXT)')
    source_code = producer_digest()
    references, processed = [], 0
    extract_by_id = {item['id']: item for item in plan['extracts']}
    for key, entry in sorted(entries.items(), key=lambda item: (('node', 'way', 'relation').index(item[0][0]), int(item[0][1]))):
        native_id = f'osm:{key[0]}:{key[1]}'
        signatures = {(o['version'], o['timestamp'], o['contentSha256']) for o in entry['occurrences']}
        if len(signatures) != 1:
            entry.update(disposition='unresolved', reason='Cross-extract native version, timestamp or retained geometry/tag content conflicts; no extract was preferred.')
            continue
        input_hash = digest({'occurrences': entry['occurrences'], 'boundary': census.boundary['sha256'], 'producer': source_code, 'plan': digest(plan)})
        cached = results.execute('SELECT payload FROM results WHERE identity=? AND input_sha=?', (native_id, input_hash)).fetchone()
        if cached:
            outcome = json.loads(cached[0])
        elif limit is not None and processed >= limit:
            continue
        else:
            occurrence = entry['occurrences'][0]
            store = stores[occurrence['extractId']]
            obj = store.get(*key)
            try:
                geometry, actual = build_geometry(store, obj)
                context = census.evaluate(actual, key[0] == 'node')
                tags = {k: obj['tags'][k] for k in TAGS if k in obj['tags']}
                names = list(dict.fromkeys(tags[k] for k in ('name', 'official_name', 'alt_name') if k in tags))
                evidence = []
                for item in entry['occurrences']:
                    source = citation(extract_by_id[item['extractId']])
                    source['locator'] = f"{native_id}, version {item['version']}, native edit {item['timestamp']}"
                    evidence.append(source)
                reference = {'id': native_id, 'assetId': plan['assetId'], 'assetRevision': plan['revision'],
                             'sourceUseId': use['id'], 'names': names, 'geometry': geometry, 'context': context,
                             'provenance': {'source': 'openstreetmap', 'verification': 'unverified',
                                            'native': {**entry['native'], 'version': occurrence['version'], 'timestamp': occurrence['timestamp']},
                                            'extractIds': [o['extractId'] for o in entry['occurrences']], 'evidence': evidence, 'tags': tags},
                             'limitations': LIMITATIONS[:4]}
                outcome = {'disposition': 'emitted', 'reason': 'Native geometry is supported; context and community limitations remain explicit.', 'reference': reference}
            except UnsupportedGeometry as error:
                outcome = {'disposition': 'unresolved', 'reason': str(error), 'reference': None}
            except Exception as error:
                # Unexpected processing errors remain retryable pending, not terminal exclusions.
                entry['reason'] = f'Processing failed ({type(error).__name__}): {str(error)[:300]}; retry is required.'
                continue
            processed += 1
            results.execute('INSERT OR REPLACE INTO results VALUES (?,?,?)', (native_id, input_hash, json.dumps(outcome, ensure_ascii=False, separators=(',', ':'), allow_nan=False)))
            results.commit()
        entry.update(disposition=outcome['disposition'], reason=outcome['reason'])
        if outcome['reference']:
            entry['referenceId'] = native_id
            references.append(outcome['reference'])
    results.close()
    for store in stores.values():
        store.db.close()
    ledger = sorted(entries.values(), key=lambda e: (('node', 'way', 'relation').index(e['native']['type']), int(e['native']['id'])))
    raw = sum(e['candidateOccurrences'] for e in extracts if e['status'] == 'acquired')
    counts = {'rawOccurrences': raw, 'uniqueElements': len(ledger), 'duplicateOccurrences': raw - len(ledger),
              'helperOccurrences': sum(e['helperOccurrences'] for e in extracts if e['status'] == 'acquired'),
              'emittedNodes': sum(r['geometry']['kind'] == 'node' for r in references),
              'emittedFootprints': sum(r['geometry']['kind'] == 'footprint' for r in references),
              'emittedExtents': sum(r['geometry']['kind'] == 'extent' for r in references),
              **{key: sum(e['disposition'] == key for e in ledger) for key in ('excluded', 'unresolved', 'pending')}}
    full = not counts['pending'] and all(e['status'] == 'acquired' for e in extracts)
    asset = {'version': 1, 'assetId': plan['assetId'], 'revision': plan['revision'], 'snapshotAsOf': plan['snapshotAsOf'],
             'retrievedOn': utc()[:10], 'scope': 'full' if full else 'sample', 'tag': 'power=substation', 'sourceUse': use,
             'extracts': extracts, 'references': references, 'ledger': ledger, 'counts': counts, 'limitations': LIMITATIONS}
    manifest = {'assetId': plan['assetId'], 'revision': plan['revision'], 'sourceUse': use,
                'download': {'status': 'pending', 'reason': 'No coordinator-approved public reference-database hosting offer exists. Do not distribute or activate this local asset publicly.'}}
    candidate, offer = work / 'asset.candidate.json', work / 'manifest.candidate.json'
    write(candidate, asset)
    write(offer, manifest)
    env = dict(os.environ, NODE_OPTIONS='--max-old-space-size=1536')
    subprocess.run([str(node), str(tsx), str(HERE / 'validate.mts'), str(schema_root), str(candidate), str(offer)], check=True, env=env)
    # Only authoritative schema acceptance permits final filenames and a generation receipt.
    candidate.replace(work / 'asset.json')
    offer.replace(work / 'manifest.json')
    write(work / 'generation.json', {'status': 'generated-local-only', 'scope': asset['scope'], 'generatedAt': utc(),
                                    'producerSha256': source_code, 'planSha256': digest(plan),
                                    'boundarySha256': census.boundary['sha256'], 'assetSha256': sha_file(work / 'asset.json'),
                                    'assetBytes': (work / 'asset.json').stat().st_size,
                                    'manifestSha256': sha_file(work / 'manifest.json'), 'counts': counts,
                                    'publicDistribution': 'blocked-pending-offer'})
