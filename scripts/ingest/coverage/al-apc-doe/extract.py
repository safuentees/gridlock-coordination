#!/usr/bin/env python3
"""Normalize accepted public DOE Alabama review facts against preserved original hashes."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name('catalog.json').read_text())
SOURCE = CATALOG['sourceKey']
INDEX = next(item for item in CATALOG['artifacts'] if item['file'] == 'index.html')
SAMPLE = set(CATALOG['sampleSourceRows'])
EXCLUSION_REASONS = {
    'exclude-generation': 'Generation conversion; not a separate physical transmission package.',
    'exclude-demand-side-program': 'Behind-the-meter demand-side program; no physical transmission construction.',
    'exclude-fiber-only': 'Fiber-only work; no new or altered electrical transmission facilities established.',
    'exclude-distribution': 'Distribution line and pole improvements; not transmission.',
}


def project(row):
    facts = row['normalized']
    notes = [*facts['notes'],
             f"The DOE letter is dated {row['letterDate']}; the index posting date is {row['indexPostedOn']}. Lifecycle reflects the proposed scope described in that letter, not the retrieval date.",
             'Environmental-review completion does not establish physical construction, commissioning, engineering approval or project-specific financing close. Required construction/operation permits remain separate.',
             'Alabama Power Company is the applicant/project proponent; equipment ownership is not expressly established by this review.']
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': facts['sponsor'], 'name': facts['name'], 'description': facts['description'],
        'status': 'Proposed project; environmental review completed', 'voltageKv': facts['voltageKv'],
        'date': facts['date'], 'buildWindow': None, 'location': None,
        'sources': [facts['source'], facts['indexSource']], 'notes': notes,
        'inventory': {
            'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'editionLabel': CATALOG['label'],
            'reportingGroupName': CATALOG['reportingGroupName'], 'recordKind': 'transmission-project',
            'lifecycle': 'planned', 'lifecycleAsOf': row['letterDate'], 'lifecycleDateMeaning': 'source-edition',
            'recordUnit': 'project', 'identityBasis': row['identityBasis'], 'owner': None,
            'sourceState': facts['sourceState'], 'sourceLocation': facts['sourceLocation'], 'sourceUpdatedOn': None,
            'milestones': facts['milestones'], 'parentProgramId': None, 'aliases': [],
            'workType': 'Transmission project', 'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['No numeric project coordinates, CRS or accuracy are supplied in the selected review text. County, road and cadastral descriptions remain text; no center or corridor is inferred.'],
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    for artifact in CATALOG['artifacts']:
        original = args.originals_dir / artifact['file']
        if hashlib.sha256(original.read_bytes()).hexdigest() != artifact['sha256']:
            raise ValueError('Original differs from accepted public source edition: ' + artifact['file'])
    projects, ledger = [], []
    for row in CATALOG['rows']:
        entry = {key: value for key, value in row.items() if key not in ('normalized', 'disposition')}
        if row['disposition'] in EXCLUSION_REASONS:
            entry.update(disposition='excluded', exclusionCategory=row['disposition'][8:],
                         reason=EXCLUSION_REASONS[row['disposition']], sourceScopeReason=row['reason'])
        elif args.scope == 'sample' and row['sourceRow'] not in SAMPLE:
            entry.update(disposition='pending', reason='Accepted retained transmission package awaiting provider connection before full generation.')
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'], rawFacts=row['normalized']['rawFacts'],
                         reason='One physical transmission package described by a public environmental-review letter; planned, not physically complete.')
        ledger.append(entry)
    excluded = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(excluded.values()),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    manifest = {
        'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'label': CATALOG['label'],
        'reportingGroupId': SOURCE, 'reportingGroupName': CATALOG['reportingGroupName'],
        'publisher': CATALOG['publisher'], 'processAuthority': 'DOE Office of Energy Dominance Financing environmental reviews for potential federal financial support',
        'publishedOn': None, 'retrievedOn': CATALOG['retrievedOn'],
        'source': {'file': INDEX['file'], 'url': INDEX['url'], 'locator': 'Documents Available for Download, all twelve entries in observed index order, September 30, 2026'},
        'sha256': INDEX['sha256'], 'geographicScope': 'Alabama; each retained letter explicitly identifies its county or counties.',
        'inventoryScope': 'All twelve DOE Alabama Power review entries: six physical transmission packages retained; one generation, one demand-side program, two fiber-only and two distribution entries excluded.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in excluded.items()],
        'limitations': [
            'This is a finite featured/funding-review subset, not a complete Alabama Power transmission register or statewide inventory. Broader project denominators remain unknown.',
            'The composite index snapshot has no single publication date. Per-record lifecycleAsOf is its letter date, not index posting or retrieval; four index/letter date differences remain explicit, including excluded Roanoke.',
            'All six retained packages are planned. Environmental-review completion and a program-level loan guarantee do not establish physical progress, commissioning, engineering approval or project-specific financing close.',
            'Five APC review/project numbers are native only within this source context. Lock 5 uses a named-review source locator; environmental consultation codes are not engineering IDs. No cross-source identity is inferred.',
            'Lock 5 voltage is unknown because only future 500/230 kV terminal accommodation is stated. South Bessemer retains 500 kV for specified served circuits while its existing 500/230/115 kV station and autobank remain contextual.',
            'Thurlow and Bassett commercial-operation targets are month-precision service forecasts. South Bessemer May 2030 is completion with unknown kind; the other three have no completion/service target. Forecast starts remain milestones, never actual construction bounds.',
            'All asset owners, numeric geometry, construction windows, actual construction starts and row-update days are unknown. Applicant/borrower identity does not prove equipment ownership.',
            'Index and all twelve PDFs are checksum-pinned in the catalog and row ledger. No original binaries, contact details, map-derived centers or restricted SERTP material are included. Public downloadability does not establish blanket redistribution permission.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': CATALOG['label'] + ' — ' + args.scope,
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                            'notes': [f"12 review entries = {len(projects)} imported + 6 excluded + {counts['pendingRows']} pending.",
                                      'Accepted public factual catalog normalized against preserved source hashes; review findings are distinct from physical progress.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope,
                  'artifacts': CATALOG['artifacts'], 'counts': counts,
                  'recordKindCounts': {'transmission-project': len(projects)}, 'lifecycleCounts': {'planned': len(projects)},
                  'completeRetainedRecordKindCounts': {'transmission-project': 6}, 'completeRetainedLifecycleCounts': {'planned': 6}, 'rows': ledger}
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
    print(json.dumps({'counts': counts, 'lifecycleCounts': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
