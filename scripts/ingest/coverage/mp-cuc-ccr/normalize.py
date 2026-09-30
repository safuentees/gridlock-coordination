#!/usr/bin/env python3
"""Normalize this adapter's accepted factual catalog against preserved public originals."""
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
    # A small, audited narrative source is normalized from factual paraphrases,
    # not re-scraped into guessed rows. A new source edition requires qualification.
    for original in config['originals']:
        path = args.original_dir / original['file']
        if hashlib.sha256(path.read_bytes()).hexdigest() != original['sha256']:
            raise ValueError(f"Original differs from the accepted source: {original['file']}")
    if len(rows) != config['expectedSourceRows'] or len({row['sourceId'] for row in rows}) != len(rows):
        raise ValueError('Accepted source entry count or unique locator identities changed.')
    retained = [row for row in rows if row['disposition'] == 'retained']
    if len(retained) != config['expectedRetained'] or any(row['disposition'] not in ('retained', 'excluded') for row in rows):
        raise ValueError('Accepted source disposition boundary changed.')
    sample_ids = set(config['sampleIds'])
    if len(sample_ids) != 3 or not sample_ids.issubset({row['sourceId'] for row in retained}):
        raise ValueError('The connected sample must contain the three accepted retained entries.')
    projects, ledger, exclusions = [], [], Counter()
    for row in rows:
        entry = {'sourceId': row['sourceId'], 'sourceProjectName': row['name'], 'sources': row['sources']}
        if row['disposition'] == 'excluded':
            exclusions[row['reason']] += 1
            entry.update(disposition='excluded', reason=row['reason'])
            entry['evidenceSummary'] = row['description']
            if row['notes']:
                entry['notes'] = row['notes']
        else:
            entry.update(recordKind=row['recordKind'], recordUnit=row['recordUnit'], lifecycle=row['lifecycle'], sourceStatus=row['status'], date=row['date'])
            if args.scope == 'full' or row['sourceId'] in sample_ids:
                milestones = []
                if row['date']['value'] is not None:
                    milestones.append({'field': row['date']['label'], 'date': row['date'], 'evidence': row.get('dateEvidence', row['sources'][:1])})
                milestones.extend(row['milestones'])
                project = {
                    'id': f"{key}:{row['sourceId']}", 'utilityId': key, 'sourceId': row['sourceId'], 'sponsor': None,
                    'name': row['name'], 'description': row['description'], 'status': row['status'], 'voltageKv': row['voltageKv'],
                    'date': row['date'], 'buildWindow': None, 'location': None, 'sources': row['sources'], 'notes': row['notes'],
                    'inventory': {
                        'sourceKey': key, 'editionId': config['editionId'], 'editionLabel': config['label'], 'reportingGroupName': config['group'],
                        'recordKind': row['recordKind'], 'recordUnit': row['recordUnit'], 'identityBasis': 'source-locator',
                        'lifecycle': row['lifecycle'], 'lifecycleAsOf': row.get('lifecycleAsOf', config['lifecycleAsOf']),
                        'lifecycleDateMeaning': row.get('lifecycleDateMeaning', config['lifecycleDateMeaning']),
                        'sourceUpdatedOn': None, 'sourceState': row['sourceState'], 'sourceLocation': row['sourceLocation'],
                        'owner': None, 'parentProgramId': None, 'aliases': row['aliases'], 'workType': None,
                        'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
                        'locationAssumptions': ['Source area/endpoints are descriptive text only. No qualified native center, CRS or accuracy is supplied; linked maps were not interpreted.'],
                        'milestones': milestones,
                    },
                }
                projects.append(project)
                entry.update(disposition='imported', projectId=project['id'])
            else:
                entry.update(disposition='pending', reason='Accepted retained entry; normalization awaits sample connection.')
        ledger.append(entry)
    imported = config['expectedRetained'] if args.scope == 'full' else 3
    counts = {'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()), 'failedRows': 0,
              'pendingRows': sum(entry['disposition'] == 'pending' for entry in ledger), 'locatedRecords': 0}
    if counts != {'sourceRows': config['expectedSourceRows'], 'importedRecords': imported, 'excludedRows': config['expectedExcluded'],
                  'failedRows': 0, 'pendingRows': config['expectedRetained'] - imported, 'locatedRecords': 0}:
        raise ValueError('Accepted complete-source reconciliation changed.')
    limitations = config['limitations'] + [
        'No singular asset owner, native project center or exact construction interval is supplied. Publisher/developer context is not inferred ownership.',
        'Concise factual paraphrases and citations are used for authorized private analysis; no original PDF/website prose publication or open/commercial reuse license is asserted.',
    ]
    if args.scope == 'sample':
        limitations.append(f"Three retained diagnostics are emitted first; {counts['pendingRows']} accepted entries await provider connection and full normalization.")
    manifest = {
        'sourceKey': key, 'editionId': config['editionId'], 'label': config['label'], 'reportingGroupId': key, 'reportingGroupName': config['group'],
        'publisher': config['publisher'], 'processAuthority': config['processAuthority'],
        'publishedOn': config['publishedOn'], 'retrievedOn': '2026-09-30', 'source': config['manifestSource'], 'sha256': config['manifestHash'],
        'geographicScope': config['geographicScope'], 'inventoryScope': config['inventoryScope'], 'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(exclusions.items())], 'limitations': limitations,
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': config['label'] + (' — three-record sample' if args.scope == 'sample' else ' — full accepted scope'),
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': sum(exclusions.values()), 'failed': 0,
                            'notes': [f"All {len(rows)} declared source entries are reconciled; {counts['pendingRows']} retained entries remain pending.",
                                      'Counts are contextual source entries, not transmission-qualified or unique engineering projects.']}}
    quality = {'sourceKey': key, 'editionId': config['editionId'], 'scope': args.scope, 'normalizationMethod': 'Audited factual catalog with exact preserved-source hashes and locators; no image/map interpretation.',
               'acceptedRetainedLifecycleCounts': dict(sorted(Counter(row['lifecycle'] for row in retained).items())),
               'acceptedRetainedKindCounts': dict(sorted(Counter(row['recordKind'] for row in retained).items())),
               'acceptedRetainedDatePrecisionCounts': dict(sorted(Counter(row['date']['precision'] for row in retained).items())),
               'importedLifecycleCounts': dict(sorted(Counter(project['inventory']['lifecycle'] for project in projects).items())),
               'importedKindCounts': dict(sorted(Counter(project['inventory']['recordKind'] for project in projects).items())),
               'sampleIds': [f'{key}:{native_id}' for native_id in config['sampleIds']], 'originals': config['originals'],
               'relationshipsAndPrecedence': config['limitations'],
               'supplementalScenarioRows': catalog.get('supplementalScenarioRows', []),
               'otherSupplementalContext': catalog.get('otherSupplementalContext', [])}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, value in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', ledger), ('source-quality.json', quality)]:
        (args.output_dir / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    sizes = {'scope': args.scope, 'datasetRecords': len(projects),
             'compactUtf8Bytes': len(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')).encode()),
             'formattedUtf8Bytes': (args.output_dir / 'dataset.json').stat().st_size}
    (args.output_dir / 'payload-sizes.json').write_text(json.dumps(sizes, indent=2) + '\n')
    print(json.dumps({'sourceKey': key, 'counts': counts, 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
