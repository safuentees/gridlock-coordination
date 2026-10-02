#!/usr/bin/env python3
"""Cache official Census ACS2025 polygons once, in sequential bounded batches.

No project geocoding. Originals and acquisition log belong in ignored inputs.
Existing snapshots are reused, never replaced. Re-run with --layers to extend.
"""
import argparse
import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer'
LAYERS = {'states': 80, 'counties': 82, 'incorporated-places': 28, 'census-designated-places': 30}
USE = 'U.S. Census Bureau government data; reproduction permitted with requested attribution. Statistical reference boundaries, not legal land descriptions; no positional or attribute accuracy warranty.'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals', type=Path, required=True)
    parser.add_argument('--layers', nargs='+', choices=LAYERS, default=['states', 'counties'])
    args = parser.parse_args()
    args.originals.mkdir(parents=True, exist_ok=True)
    log_path = args.originals / 'acquisition.json'
    log = json.loads(log_path.read_text()) if log_path.exists() else {'version': 1, 'vintage': '2025-01-01', 'files': {}, 'layers': {}}

    def save_log():
        log_path.write_text(json.dumps(log, ensure_ascii=False, indent=2) + '\n')

    def obtain(filename, url, as_json=True):
        path = args.originals / filename
        if filename in log['files']:
            entry = log['files'][filename]
            data = path.read_bytes()
            if hashlib.sha256(data).hexdigest() != entry['sha256'] or entry['url'] != url:
                raise ValueError(f'Preserved source mismatch: {filename}; do not overwrite originals')
            return json.loads(data) if as_json else data
        if path.exists():
            raise ValueError(f'Unregistered original exists: {filename}; preserve and reconcile before acquiring')
        request = Request(url, headers={'User-Agent': 'Gridlock geographic reference snapshot (public Census research)', 'Accept': 'application/json' if as_json else 'application/pdf'})
        with urlopen(request, timeout=180) as response:
            data = response.read()
        parsed = json.loads(data) if as_json else data
        if as_json and 'error' in parsed:
            raise RuntimeError(f'Census error for {filename}: {parsed["error"]}')
        with path.open('xb') as handle:
            handle.write(data)
        log['files'][filename] = {'url': url, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'retrievedAt': datetime.now(timezone.utc).isoformat(), 'permittedUse': USE}
        save_log()
        print(f'Acquired {filename}: {len(data):,} bytes', flush=True)
        time.sleep(0.35)
        return parsed

    obtain('TGRSHP2025_TechDoc_Ch1.pdf', 'https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2025/TGRSHP2025_TechDoc_Ch1.pdf', False)
    for name in args.layers:
        layer = LAYERS[name]
        obtain(f'{name}-metadata.json', f'{BASE}/{layer}?f=pjson')
        count = obtain(f'{name}-count.json', f'{BASE}/{layer}/query?' + urlencode({'where': '1=1', 'returnCountOnly': 'true', 'f': 'json'}))['count']
        fields = 'GEOID,STATE,NAME,BASENAME,STUSAB' if name == 'states' else 'GEOID,STATE,NAME,BASENAME'
        batch_size = 5 if name == 'states' else (100 if name == 'counties' else 250)
        layer_log = {'layerId': layer, 'count': count, 'batchSize': batch_size, 'files': []}
        for offset in range(0, count, batch_size):
            filename = f'{name}-{offset:05d}.json'
            url = f'{BASE}/{layer}/query?' + urlencode({'where': '1=1', 'outFields': fields, 'returnGeometry': 'true', 'outSR': '4326', 'orderByFields': 'GEOID ASC', 'resultOffset': offset, 'resultRecordCount': batch_size, 'f': 'json'})
            page = obtain(filename, url)
            # Source pagination/accounting guards are part of acquisition, not application tests.
            if page.get('spatialReference', {}).get('wkid') != 4326:
                raise ValueError(f'Unexpected source output CRS in {filename}')
            if len(page.get('features', [])) != min(batch_size, count - offset):
                raise ValueError(f'Incomplete source page {filename}; preserve evidence and resolve pagination')
            layer_log['files'].append(filename)
        log['layers'][name] = layer_log
        save_log()
        print(f'Complete source layer {name}: {count:,} features', flush=True)


if __name__ == '__main__':
    main()
