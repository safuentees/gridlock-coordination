#!/usr/bin/env python3
"""Normalize the accepted Georgia Power public catalog without altering preserved originals."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name('catalog.json').read_text())
SOURCE = CATALOG['sourceKey']
INDEX = next(item for item in CATALOG['artifacts'] if item['file'] == 'index.html')
SAMPLE = set(CATALOG['sampleSourceIds'])


def index_ref(row=None):
    locator = 'Current Projects, all ten linked project entries in observed order, September 30, 2026'
    if row:
        locator = f"Current Projects, entry {row['sourceRow']}: {row['indexTitle']}; Type and County/Region fields"
    return {'file': INDEX['file'], 'url': INDEX['url'], 'locator': locator}


def project(row):
    facts = row['normalized']
    inventory = dict(facts['inventoryProposal'])
    inventory.update(editionLabel=CATALOG['label'], aliases=[], workType=row['indexType'],
                     locationAssumptions=['No native geometry with project identity, role, CRS and accuracy is supplied. Named counties, routes and pre-engineering map depictions do not establish a project center.'])
    notes = [facts['note'], row['reason'],
             f"Index type: {row['indexType']}. Index county/region: {row['indexCountyRegion']}.",
             'Quarter and season milestone labels are retained as published; no exact project date or construction interval is inferred. The source schedule is tentative.',
             'Lifecycle was observed on September 30, 2026. Page publication/update dates are unknown; retrieval and HTTP Last-Modified do not establish current physical progress.',
             'Georgia Power is the reporter/developer. The reviewed public text does not establish specific equipment ownership.']
    if facts.get('possibleHistoricalIds'):
        notes.append('Possible name-based historical review lead: ' + ', '.join(facts['possibleHistoricalIds']) + '. No authoritative identity crosswalk is supplied; dates, ownership, geometry and identity are not inherited.')
    if row['sourceId'] == 'decatur-scottdale':
        notes.append('The roughly 2.5-mile rebuild and roughly 0.7-mile relocation are not independent lengths to sum. The stated 1965 construction year belongs to the existing infrastructure, not this upgrade.')
    if row['sourceId'] == 'hills-bridge-speedway':
        notes.append('The page title gives 500/230 kV while introductory prose shortens it to 500 kV. The detailed program includes both voltage classes; the index single-line label does not define its full unit.')
    primary_label = ('No completion or service milestone published' if row['sourceId'] in ('callaway-thomson', 'effingham-county')
                     else 'Primary date unknown; raw tentative quarter/season milestones retained without invented precision')
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': 'Georgia Power (reporter/developer)', 'name': facts['name'], 'description': facts['description'],
        'status': None, 'voltageKv': facts['voltageKv'],
        'date': {'value': None, 'precision': 'unknown', 'kind': 'unknown', 'label': primary_label},
        'buildWindow': None, 'location': None,
        'sources': [index_ref(row), *facts['sourceEvidence']], 'notes': notes, 'inventory': inventory,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    for artifact in CATALOG['artifacts']:
        if hashlib.sha256((args.originals_dir / artifact['file']).read_bytes()).hexdigest() != artifact['sha256']:
            raise ValueError('Original differs from the accepted observed catalog: ' + artifact['file'])
    if args.scope == 'full' and any('normalized' not in row for row in CATALOG['rows']):
        raise ValueError('Only the six-record connection sample is normalized; remaining four wait for coordinator provider connection and dispatch.')
    projects, ledger = [], []
    for row in CATALOG['rows']:
        entry = {key: value for key, value in row.items() if key not in ('normalized', 'disposition')}
        entry['source'] = index_ref(row)
        if args.scope == 'sample' and row['sourceId'] not in SAMPLE:
            entry.update(disposition='pending', dispositionReason='Accepted page observation awaiting normalization after the sample is connected.')
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'],
                         dispositionReason='One accepted page observation; component scopes remain together and historical filings remain separate.')
            if row['normalized'].get('supportingNotice'):
                entry['supportingNotice'] = row['normalized']['supportingNotice']
                entry['supportingPublishedOn'] = row['normalized'].get('supportingPublishedOn')
        ledger.append(entry)
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': 0, 'failedRows': 0,
              'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    manifest = {
        'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'label': CATALOG['label'],
        'reportingGroupId': SOURCE, 'reportingGroupName': CATALOG['reportingGroupName'],
        'publisher': CATALOG['publisher'], 'processAuthority': 'Georgia Power public project information catalog',
        'publishedOn': None, 'retrievedOn': CATALOG['retrievedOn'], 'source': index_ref(), 'sha256': INDEX['sha256'],
        'geographicScope': 'Georgia project catalog, including a Big Tazewell–Farley endpoint explicitly in Alabama; per-record state is supplied only when explicit.',
        'inventoryScope': 'All ten Current Projects page entries: six transmission project/upgrade observations and four area-program capital contexts; no exclusions. Supporting notices are evidence, not additional rows.',
        'scope': args.scope, 'counts': counts, 'exclusions': [],
        'limitations': [
            'This is a complete featured catalog subset, not a complete Georgia Power or statewide inventory. Page observations and component scopes do not establish a count of distinct engineering projects.',
            'Four multi-component programs remain capital-project-context with recordUnit omitted. Decatur is a transmission upgrade; the other five transmission observations are projects. One page stays one observation.',
            'Full accepted lifecycle is three planned and seven unknown. Mixed component stages, generic construction prose, tentative schedules and historical notices do not confirm current project-wide construction.',
            'Primary dates, actual construction starts and windows remain unknown. Quarter/season milestones retain raw labels with unknown precision/kind and null values; no quarter boundaries or silent year coercion are manufactured.',
            'Catalog publication and per-project update dates are unknown. Observation on September 30, 2026 is not freshness; dated July 2026 and October 2025 notices apply only to their stated historical scope.',
            'All owners, centers and native geometry are unknown. Reporter/developer, easements and customer land do not prove equipment ownership; pre-engineering route depictions and map viewports do not establish qualifying coordinates.',
            'Index/detail geography and scope differences remain visible, including Alabama at Big Tazewell–Farley, intermediate Ashley counties and the Hills Bridge multi-component voltage/program scope.',
            'Page basenames are stable source-locator identities, not native engineering IDs. Historical Georgia and other-source observations remain separate with no inherited dates/owners/geometry or name-based merge.',
            'Index, ten pages and four supporting notices are checksum-pinned outside runtime. Original bytes are unchanged; no contacts, restricted SERTP content, map-derived coordinates or ungrounded project quantities are imported.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': CATALOG['label'] + ' — ' + args.scope,
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': 0, 'failed': 0,
                            'notes': [f"10 page observations = {len(projects)} imported + {counts['pendingRows']} pending; zero exclusions.",
                                      'Source catalog normalized against all preserved original hashes; prior Georgia filing observations remain unchanged.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope,
                  'artifacts': CATALOG['artifacts'], 'counts': counts,
                  'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
                  'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
                  'completeRetainedRecordKindCounts': dict(Counter(row['recordKind'] for row in CATALOG['rows'])),
                  'completeRetainedLifecycleCounts': dict(Counter(row['lifecycle'] for row in CATALOG['rows'])), 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope, 'records': len(projects),
             'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
             'measurement': 'Source-only Dataset2 UTF-8 JSON including final newline; aggregate/export envelope can be larger.',
             'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for filename, value in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / filename).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'counts': counts, 'recordKindCounts': row_ledger['recordKindCounts'], 'lifecycleCounts': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
