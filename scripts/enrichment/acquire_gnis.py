#!/usr/bin/env python3
"""Preserve complete official GNIS snapshots and extract administrative fields only.

No geometry is read into the extracted rows. Originals are immutable and belong
outside Git. The Historical Features companion supplies an explicit ID exclusion.
"""
import argparse
import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET
import zipfile

BASE = 'https://prd-tnm.s3.amazonaws.com/StagedProducts/GeographicNames/'
FILES = {
    'PopulatedPlaces_National_Text.zip': BASE + 'Topical/PopulatedPlaces_National_Text.zip',
    'HistoricalFeatures_National_Text.zip': BASE + 'Topical/HistoricalFeatures_National_Text.zip',
    'GNIS_file_format.pdf': BASE + 'GNIS_file_format.pdf',
    'download-gnis-data.html': 'https://www.usgs.gov/us-board-on-geographic-names/download-gnis-data',
    'domestic-names.html': 'https://www.usgs.gov/us-board-on-geographic-names/domestic-names',
}
FIELDS = ['feature_id', 'feature_name', 'feature_class', 'state_name', 'state_numeric', 'county_name', 'county_numeric']


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals', type=Path, required=True)
    args = parser.parse_args()
    args.originals.mkdir(parents=True, exist_ok=True)
    manifest_path = args.originals / 'acquisition.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'version': 1, 'files': {}}
    for name, url in FILES.items():
        path = args.originals / name
        if name in manifest['files']:
            old = manifest['files'][name]
            if old['url'] != url or sha(path.read_bytes()) != old['sha256']:
                raise ValueError('Preserved original mismatch: ' + name)
            continue
        if path.exists():
            raise ValueError('Unregistered original; will not overwrite: ' + name)
        # One ordinary anonymous request per source; access/rate failures stop.
        with urlopen(Request(url, headers={'User-Agent': 'Gridlock-public-reference/1.0'}), timeout=90) as response:
            raw = response.read()
            headers = {'contentType': response.headers.get('Content-Type'), 'lastModified': response.headers.get('Last-Modified'), 'etag': response.headers.get('ETag')}
        with path.open('xb') as handle:
            handle.write(raw)
        manifest['files'][name] = {'url': url, 'sha256': sha(raw), 'bytes': len(raw), 'retrievedAt': datetime.now(timezone.utc).isoformat(), **headers}
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
        print(f'Preserved {name}: {len(raw):,} bytes', flush=True)

    def archive(kind):
        name = kind + '_National_Text.zip'
        z = zipfile.ZipFile(args.originals / name)
        text_name = 'Text/' + kind + '_National.txt'
        xml_name = kind + '_National_Text.xml'
        text_raw, xml_raw = z.read(text_name), z.read(xml_name)
        metadata = ET.fromstring(xml_raw)
        publication = metadata.findtext('idinfo/citation/citeinfo/pubdate')
        use = metadata.findtext('idinfo/useconst')
        access = metadata.findtext('idinfo/accconst')
        if access != 'None' or not use.startswith('None.'):
            raise ValueError('Source access/use changed; coordinator decision required')
        record = {'archive': name, 'textMember': text_name, 'textSha256': sha(text_raw), 'metadataMember': xml_name, 'metadataSha256': sha(xml_raw), 'publication': publication, 'accessConstraints': access, 'useConstraints': use}
        rows = csv.DictReader(io.StringIO(text_raw.decode('utf-8-sig')), delimiter='|')
        if not all(key in rows.fieldnames for key in FIELDS):
            raise ValueError('Required GNIS administrative fields missing')
        return rows, record

    historical_rows, history = archive('HistoricalFeatures')
    historical_ids = {row['feature_id'] for row in historical_rows}
    rows, populated = archive('PopulatedPlaces')
    if populated['publication'] != history['publication']:
        raise ValueError('Companion editions differ; preserve snapshots and resolve before publication')
    output = args.originals / 'administrative-rows.jsonl'
    count, marked = 0, 0
    id_counts = {}
    with output.open('w', encoding='utf-8') as handle:
        for line, row in enumerate(rows, start=2):
            id_counts[row['feature_id']] = id_counts.get(row['feature_id'], 0) + 1
            # Coordinate, map, date and contact fields are never consumed or emitted.
            item = {key: row[key] for key in FIELDS}
            item['line'] = line
            item['historical'] = row['feature_id'] in historical_ids or '(historical)' in row['feature_name'].lower()
            count += 1
            marked += item['historical']
            handle.write(json.dumps(item, ensure_ascii=False, separators=(',', ':')) + '\n')
    info = {'version': 1, 'downloads': manifest['files'], 'populated': populated, 'historical': history, 'rawRows': count, 'uniqueFeatureIds': len(id_counts), 'repeatedFeatureIds': {key: n for key, n in id_counts.items() if n > 1}, 'historicalCompanionIds': len(historical_ids), 'historicalPopulatedRows': marked, 'administrativeRowsSha256': sha(output.read_bytes()), 'consumedFields': FIELDS}
    (args.originals / 'administrative-snapshot.json').write_text(json.dumps(info, indent=2) + '\n')
    print(json.dumps({key: info[key] for key in ['rawRows', 'historicalCompanionIds', 'historicalPopulatedRows']}, indent=2), flush=True)


if __name__ == '__main__':
    main()
