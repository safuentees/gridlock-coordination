#!/usr/bin/env python3
"""Build the local companion reference bundle from preserved source snapshots.

Reads complete acquired Census layers and only coordinator-accepted BPA pins.
Never edits Project records or derives project centers, routes or accuracy.
"""
import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_BASE = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer'
LAYER_KINDS = {'states': ('state', 'state'), 'counties': ('county', 'county'), 'incorporated-places': ('town', 'town'), 'census-designated-places': ('town', 'town')}
CENSUS_LIMITS = [
    'Bounding extent of a January 1, 2025 Census geographic area, not a project position, route, surveyed boundary or project center.',
    'Full source polygons may contain water, holes, disconnected parts or dateline-spanning parts; a rectangular extent includes intervening space and is only geographic context.',
    'Source service WKID 102100/latestWKID 3857; Census returned EPSG:4326 through outSR=4326. Numeric positional accuracy is not supplied.',
]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals', type=Path, required=True)
    parser.add_argument('--bpa-originals', type=Path, required=True)
    parser.add_argument('--base-references', type=Path, help='Reuse previously emitted state/county entries when every source hash agrees with acquisition.json')
    args = parser.parse_args()
    log = json.loads((args.originals / 'acquisition.json').read_text())
    sources = []
    used_files = set()
    baseline_raw = args.base_references.read_bytes() if args.base_references else None
    baseline = json.loads(baseline_raw) if baseline_raw else None

    def original(filename):
        entry = log['files'][filename]
        raw = (args.originals / filename).read_bytes()
        if digest(raw) != entry['sha256']:
            raise ValueError(f'Original hash mismatch: {filename}')
        if filename not in used_files:
            sources.append({'id': 'census-acs2025:' + filename.removesuffix('.json').removesuffix('.pdf'), 'evidence': {'file': filename, 'locator': 'Complete preserved public Census response; see acquisition.json for retrieval timestamp and byte length', 'url': entry['url']}, 'permittedUse': entry['permittedUse'], 'sha256': entry['sha256']})
            used_files.add(filename)
        return json.loads(raw)

    if 'states' not in log['layers'] or 'counties' not in log['layers']:
        raise ValueError('The first connected bundle requires complete state and county source layers')
    states = {}
    references = []
    counts = {}
    legal = log['files']['TGRSHP2025_TechDoc_Ch1.pdf']
    sources.append({'id': 'census-2025-use-terms', 'evidence': {'file': 'TGRSHP2025_TechDoc_Ch1.pdf', 'locator': 'Chapter 1, sections 1.1–1.2: use/disclaimer and citation', 'url': legal['url']}, 'permittedUse': legal['permittedUse'], 'sha256': legal['sha256']})
    for layer_name, (kind, precision) in LAYER_KINDS.items():
        if layer_name not in log['layers']:
            continue
        layer = log['layers'][layer_name]
        if baseline and kind in ('state', 'county'):
            filenames = [layer_name + '-metadata.json', layer_name + '-count.json', *layer['files']]
            old_sources = {source['evidence']['file']: source for source in baseline['sources']}
            reusable = [ref for ref in baseline['references'] if ref['id'].startswith(f'census-acs2025:{kind}:')]
            if len(reusable) != layer['count'] or any(name not in old_sources or old_sources[name]['sha256'] != log['files'][name]['sha256'] for name in filenames):
                raise ValueError(f'Incremental base/source manifest mismatch for {layer_name}; full rebuild required')
            for name in filenames:
                sources.append(old_sources[name])
                used_files.add(name)
            references.extend(reusable)
            if kind == 'state':
                states.update({ref['id'].split(':')[-1]: ref['stateCodes'][0] for ref in reusable})
            counts[layer_name] = len(reusable)
            print(f'Reused complete {layer_name}: {len(reusable):,} references from the versioned base', flush=True)
            continue
        original(layer_name + '-metadata.json')
        original(layer_name + '-count.json')
        layer_count = 0
        for filename in layer['files']:
            print(f'Deriving extents from {filename}', flush=True)
            page = original(filename)
            for feature in page['features']:
                props = feature['attributes']
                if kind == 'state':
                    states[props['STATE']] = props['STUSAB']
                state_code = states[props['STATE']]
                positions = [position for ring in feature['geometry']['rings'] for position in ring]
                bounds = [min(p[0] for p in positions), min(p[1] for p in positions), max(p[0] for p in positions), max(p[1] for p in positions)]
                # Compute extent from every published vertex, without simplification or rounding.
                if not (-180 <= bounds[0] < bounds[2] <= 180 and -90 <= bounds[1] < bounds[3] <= 90):
                    raise ValueError(f'Source extent needs explicit handling: {layer_name} {props["GEOID"]}: {bounds}')
                names = list(dict.fromkeys([props['NAME'], props['BASENAME']] + ([state_code] if kind == 'state' else [])))
                references.append({
                    'id': f'census-acs2025:{kind}:{props["GEOID"]}', 'names': names, 'kind': kind,
                    'stateCodes': [state_code], 'sourceKeys': [], 'projectIds': [],
                    'representation': {'kind': 'area', 'method': 'geographic-area', 'bounds': bounds, 'precision': precision, 'boundaryMeaning': 'bounding-extent', 'label': props['NAME'] + ('' if kind == 'state' else f', {state_code}'), 'evidence': [{'file': filename, 'locator': f'ACS2025 layer {layer["layerId"]}; GEOID={props["GEOID"]}; NAME/BASENAME/STATE and full geometry.rings; bounds derived from all vertices', 'url': f'{SOURCE_BASE}/{layer["layerId"]}'}], 'limitations': CENSUS_LIMITS, 'accuracyMeters': None},
                })
                layer_count += 1
        counts[layer_name] = layer_count
        if layer_count != layer['count']:
            raise ValueError(f'Source layer is incomplete: {layer_name}')

    accepted_path = ROOT / 'app/src/data/evidence/f27-map-location-proposals.json'
    accepted_raw = accepted_path.read_bytes()
    accepted = json.loads(accepted_raw)
    guards = json.loads(subprocess.check_output(['node', str(ROOT / 'scripts/enrichment/project_fingerprints.mjs'), str(accepted_path)], text=True))
    allowed = {'bpa-plan:P05449', 'bpa-plan:sec-2-cross-cascades-north-olympia', 'bpa-plan:P04364'}
    bpa_raw = (args.bpa_originals / 'gerp-substations-features.json').read_bytes()
    bpa_features = json.loads(bpa_raw)
    bpa_url = 'https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/Evolving_Grid_Substation_Projects/FeatureServer/10/query?where=1%3D1&outFields=%2A&returnGeometry=true&outSR=4326&f=json&resultRecordCount=2000'
    sources.extend([
        {'id': 'bpa-gerp-substations-2026-09-30', 'evidence': {'file': 'gerp-substations-features.json', 'locator': 'Preserved September 30, 2026 EPSG:4326 source response; only the three accepted exact Project IDs are emitted', 'url': bpa_url}, 'permittedUse': 'Attributed public factual reference for informational geographic context; no surveyed/legal boundary, current construction or ownership claim. Source snapshot remains preserved outside Git.', 'sha256': digest(bpa_raw)},
        {'id': 'bpa-accepted-general-pins', 'evidence': {'file': 'app/src/data/evidence/f27-map-location-proposals.json', 'locator': 'Coordinator-accepted proposals for Keeler, Olympia child and Schultz; source-backed derived artifact', 'url': 'https://github.com/safuentees/gridlock-coordination/blob/ae0069cdc3c9414fe2d2392f458b731e29a0cd4e/app/src/data/evidence/f27-map-location-proposals.json'}, 'permittedUse': 'Coordinator-accepted factual general-pin evidence for the three exact Project IDs only; withheld BPA decisions are excluded.', 'sha256': digest(accepted_raw)},
    ])
    for proposal in accepted['proposals']:
        if proposal['projectId'] not in allowed:
            continue
        expected = proposal['expected']
        if proposal['centerRole'] != 'general-pin' or proposal['nativeGeometry']['role'] != 'general-pin':
            raise ValueError('Only accepted BPA general pins may enter this reference layer')
        native = proposal['nativeGeometry']['coordinates'][0]
        if not any([f['geometry']['x'], f['geometry']['y']] == native for f in bpa_features['features']):
            raise ValueError('Accepted coordinate is absent from the preserved BPA response')
        references.append({
            'id': 'bpa-gerp:' + proposal['decisionId'], 'kind': 'facility', 'names': [expected['name']],
            'stateCodes': [expected['inventory']['sourceState']], 'sourceKeys': ['bpa-plan'], 'projectIds': [proposal['projectId']],
            'projectFingerprints': {proposal['projectId']: guards[proposal['projectId']]},
            'representation': {'kind': 'point', 'method': 'matched-facility', 'position': native, 'precision': 'facility', 'label': expected['name'] + ' — approximate existing-yard pin', 'accuracyMeters': None, 'evidence': proposal['location']['evidence'], 'limitations': list(dict.fromkeys(['General pin only: the published feature may be a yard center or baseline intersection; neither an equipment position nor a construction/project center is established.', 'Exact accepted Project ID only; no name-based transfer to another work unit and no strict matching eligibility.', *proposal['limitations'], *proposal['locationAssumptions']]))},
        })
    # Acquisition completeness/uniqueness guards prevent publishing truncated snapshots.
    if len({ref['id'] for ref in references}) != len(references):
        raise ValueError('Reference identity collision; preserve both originals and resolve before publishing')
    # Reference revisions cover both source hashes and emitted semantics, so a producer
    # correction invalidates cached enrichment even when the upstream bytes did not change.
    revision_input = {'producerVersion': 2, 'sources': sources, 'references': references}
    source_fingerprint = digest(json.dumps(revision_input, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())[:16]
    missing = [name for name in LAYER_KINDS if name not in counts]
    bundle = {
        'version': 1, 'revision': 'census-acs2025-bpa-' + source_fingerprint,
        'retrievedOn': max(entry['retrievedAt'][:10] for entry in log['files'].values()),
        'sources': sources, 'references': references,
        'limitations': [
            'Census entities are geographic context, not project or facility centers. No Census internal point or centroid is emitted.',
            'Reference presence is not identity evidence for every source string; state, county and place ambiguity must be resolved by the separate pipeline.',
            'Area bounds enclose full source polygons and can be very broad for disconnected/dateline-spanning areas; numeric accuracy remains unknown.',
            'Only three coordinator-accepted BPA exact-ID general pins are included. Buckley, Bonanza and Pearl withheld coordinates are not emitted.',
            'This is reusable reference coverage, not full-collection enrichment completion or a national transmission-facility gazetteer.',
            'The four declared Census layers do not include every locally named settlement: county subdivisions, GNIS-only localities and historical boundary editions are not in this bundle.',
            ('Pending Census layers: ' + ', '.join(missing)) if missing else 'All four declared Census ACS2025 layers are complete: states, county equivalents, incorporated places and census-designated places.',
        ],
    }
    output = ROOT / 'app/src/data/geography/references.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(bundle, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(json.dumps({'referenceRevision': bundle['revision'], 'censusCounts': counts, 'referencesByKind': dict(Counter(ref['kind'] for ref in references)), 'totalReferences': len(references), 'bytes': output.stat().st_size, 'pendingLayers': missing}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
