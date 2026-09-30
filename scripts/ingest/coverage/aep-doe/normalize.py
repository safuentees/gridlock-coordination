#!/usr/bin/env python3
"""Project the accepted eight-entry AEP/DOE factual catalog into Dataset v2."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    catalog = json.loads(Path(__file__).with_name('catalog.json').read_text())
    config, rows = catalog['config'], catalog['records']
    key = config['sourceKey']
    # The finite narrative source is audited factual data, not guessed PDF rows.
    # Source changes require qualification and an explicit document-ID crosswalk.
    for original in config['originals']:
        content = (args.original_dir / original['file']).read_bytes()
        if len(content) != original['bytes'] or hashlib.sha256(content).hexdigest() != original['sha256']:
            raise ValueError(f"Original differs from accepted evidence: {original['file']}")
    expected_ids = [f'review-{number:03d}' for number in range(1, 9)]
    if [row['sourceId'] for row in rows] != expected_ids:
        raise ValueError('The eight frozen source identities or their order changed.')
    if any(row['disposition'] != 'retained' or row['recordKind'] != 'transmission-project' or row['lifecycle'] != 'planned' for row in rows):
        raise ValueError('Accepted retained scope, kind or lifecycle changed.')
    if [row['recordUnit'] for row in rows] != ['upgrade'] * 7 + ['project']:
        raise ValueError('Accepted seven line upgrades and one station project changed.')
    if config['sampleIds'] != ['review-001', 'review-004', 'review-006', 'review-008']:
        raise ValueError('The four accepted diagnostics changed.')
    sample_ids = set(config['sampleIds'])
    projects, ledger = [], []
    for row in rows:
        entry = {
            'sourceId': row['sourceId'], 'sourceProjectName': row['name'], 'sources': row['sources'],
            'recordKind': row['recordKind'], 'recordUnit': row['recordUnit'], 'lifecycle': row['lifecycle'],
            'lifecycleAsOf': row['lifecycleAsOf'], 'sourceStatus': row['status'], 'date': row['date'],
        }
        if args.scope == 'full' or row['sourceId'] in sample_ids:
            milestones = []
            if row['date']['value'] is not None:
                milestones.append({'field': row['date']['label'], 'date': row['date'], 'evidence': row['dateEvidence']})
            milestones.extend(row['milestones'])
            project = {
                'id': f"{key}:{row['sourceId']}", 'utilityId': key, 'sourceId': row['sourceId'],
                'sponsor': row['sponsor'], 'name': row['name'], 'description': row['description'],
                'status': row['status'], 'voltageKv': row['voltageKv'], 'date': row['date'],
                'buildWindow': None, 'location': None, 'sources': row['sources'], 'notes': row['notes'],
                'inventory': {
                    'sourceKey': key, 'editionId': config['editionId'], 'editionLabel': config['label'],
                    'reportingGroupName': config['group'], 'recordKind': row['recordKind'], 'recordUnit': row['recordUnit'],
                    'identityBasis': 'source-locator', 'lifecycle': row['lifecycle'], 'lifecycleAsOf': row['lifecycleAsOf'],
                    'lifecycleDateMeaning': 'source-edition', 'sourceUpdatedOn': None,
                    'sourceState': row['sourceState'], 'sourceLocation': row['sourceLocation'],
                    'owner': None, 'parentProgramId': None, 'aliases': row['aliases'], 'workType': row['workType'],
                    'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
                    'locationAssumptions': ['County, endpoint, length, width and acreage descriptions are not a qualified native point or route. No coordinates, CRS or accuracy were established; maps/images were not interpreted.'],
                    'milestones': milestones,
                },
            }
            projects.append(project)
            entry.update(disposition='imported', projectId=project['id'])
        else:
            entry.update(disposition='pending', reason='Accepted retained entry; runtime normalization awaits sample connection.')
        ledger.append(entry)
    expected_imported = 8 if args.scope == 'full' else 4
    counts = {
        'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': 0, 'failedRows': 0,
        'pendingRows': sum(entry['disposition'] == 'pending' for entry in ledger), 'locatedRecords': 0,
    }
    if counts != {'sourceRows': 8, 'importedRecords': expected_imported, 'excludedRows': 0, 'failedRows': 0, 'pendingRows': 8 - expected_imported, 'locatedRecords': 0}:
        raise ValueError('The complete eight-entry source reconciliation changed.')
    limitations = list(config['limitations'])
    if args.scope == 'sample':
        limitations.append('Four retained diagnostics are emitted first; four accepted entries await provider connection and full normalization.')
    manifest = {
        'sourceKey': key, 'editionId': config['editionId'], 'label': config['label'],
        'reportingGroupId': key, 'reportingGroupName': config['group'],
        'publisher': config['publisher'], 'processAuthority': config['processAuthority'],
        'publishedOn': config['publishedOn'], 'retrievedOn': config['retrievedOn'],
        'source': config['manifestSource'], 'sha256': config['manifestHash'],
        'geographicScope': config['geographicScope'], 'inventoryScope': config['inventoryScope'],
        'scope': args.scope, 'counts': counts, 'exclusions': [], 'limitations': limitations,
    }
    dataset = {
        'schemaVersion': 2, 'mode': 'real', 'title': config['label'] + (' — four-record sample' if args.scope == 'sample' else ' — full accepted subset'),
        'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
        'coverage': {'processed': len(projects), 'skipped': 0, 'failed': 0, 'notes': [
            f"All eight index entries are reconciled; {counts['pendingRows']} accepted entries remain pending.",
            'Counts describe source observations, not net-new unique projects or complete utility/state/RTO coverage. All owners and locations remain unknown.',
        ]},
    }
    quality = {
        'sourceKey': key, 'editionId': config['editionId'], 'scope': args.scope,
        'normalizationMethod': 'Audited factual catalog with exact preserved-source hashes and locators; no images, restricted attachments or contact fields.',
        'acceptedRetainedUnitCounts': dict(sorted(Counter(row['recordUnit'] for row in rows).items())),
        'acceptedRetainedLifecycleCounts': dict(sorted(Counter(row['lifecycle'] for row in rows).items())),
        'acceptedRetainedDatePrecisionCounts': dict(sorted(Counter(row['date']['precision'] for row in rows).items())),
        'importedUnitCounts': dict(sorted(Counter(project['inventory']['recordUnit'] for project in projects).items())),
        'importedDatePrecisionCounts': dict(sorted(Counter(project['date']['precision'] for project in projects).items())),
        'sampleIds': [f'{key}:{source_id}' for source_id in config['sampleIds']], 'originals': config['originals'],
        'indexedLetters': {'total': 8, 'textReadable': 7, 'imageOnlyUnread': 1},
        'supplementalPublicLetters': {'total': 2, 'additionalRecords': 0},
        'indexVsReadableSignedDateDifferences': [
            {'sourceId': 'review-002', 'indexDate': '2026-09-09', 'signedLetterDate': '2026-09-08'},
            {'sourceId': 'review-004', 'indexDate': '2026-09-04', 'signedLetterDate': '2026-09-03'},
            {'sourceId': 'review-006', 'indexDate': '2026-07-27', 'signedLetterDate': '2026-07-24'},
            {'sourceId': 'review-007', 'indexDate': '2026-06-18', 'signedLetterDate': '2026-04-24'},
        ],
        'eastMundayEvidence': {'sourceId': 'review-008', 'readableEvidenceAsOf': '2026-05-08', 'laterIndexDate': '2026-06-18', 'laterSignedLetterDate': None, 'laterBodyRead': False},
        'possibleRelatedRecords': catalog['possibleRelatedRecords'],
        'relationshipPolicy': 'Possible observations only; no explicit DOE/RTO identity crosswalk. No merges, aliases asserting equality, owner/date transfers or net-new engineering-project count.',
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for filename, value in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', ledger), ('source-quality.json', quality)]:
        (args.output_dir / filename).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    sizes = {
        'scope': args.scope, 'datasetRecords': len(projects),
        'compactUtf8Bytes': len(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')).encode()),
        'formattedUtf8Bytes': (args.output_dir / 'dataset.json').stat().st_size,
    }
    (args.output_dir / 'payload-sizes.json').write_text(json.dumps(sizes, indent=2) + '\n')
    print(json.dumps({'sourceKey': key, 'counts': counts, 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
