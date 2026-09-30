#!/usr/bin/env python3
"""Normalize the accepted BPA plan transcription and complete source-unit ledger."""
import argparse
import json
from collections import Counter
from pathlib import Path

SOURCE = 'bpa-plan'
GROUP = 'Bonneville Power Administration plan'
LABEL = 'BPA 2025 Transmission Plan — index update August 25, 2026'


def project(table, row):
    facts = row['facts']
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        **{key: facts[key] for key in ['name', 'sponsor', 'description', 'status', 'voltageKv', 'date', 'notes']},
        'buildWindow': None, 'location': None, 'sources': row['sources'],
        'inventory': {
            'sourceKey': SOURCE, 'editionId': table['editionId'], 'editionLabel': LABEL,
            'reportingGroupName': GROUP, 'recordKind': 'transmission-project',
            'recordUnit': row['recordUnit'], 'identityBasis': row['identityBasis'],
            **{key: facts[key] for key in ['lifecycle', 'lifecycleAsOf', 'lifecycleDateMeaning',
                                         'sourceState', 'sourceLocation', 'sourceUpdatedOn', 'workType', 'milestones']},
            'owner': None, 'parentProgramId': None, 'aliases': row['aliases'],
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': [],
        },
    }


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/bpa-plan')
    args = parser.parse_args()
    table = json.loads((script_dir / 'source-records.json').read_text())
    if args.scope == 'full' and any(row['acceptedDisposition'] == 'retain' and row['facts'] is None for row in table['rows']):
        raise SystemExit('Full BPA transcription is incomplete; retained units remain pending.')
    selected = set(table['sampleLedgerIds']) if args.scope == 'sample' else {
        row['ledgerId'] for row in table['rows'] if row['acceptedDisposition'] == 'retain'
    }
    identities = {row['ledgerId']: SOURCE + ':' + row['sourceId']
                  for row in table['rows'] if row['sourceId'] is not None}
    projects, ledger = [], []
    for row in table['rows']:
        accepted = row['acceptedDisposition']
        if accepted != 'retain':
            disposition, reason = 'excluded', row['exclusionReason']
        elif row['ledgerId'] not in selected or row['facts'] is None:
            disposition = 'pending'
            reason = 'Accepted retained unit outside this sample' if row['facts'] else 'Accepted retained unit; cited production transcription pending'
        else:
            disposition, reason = 'imported', 'Accepted physical transmission work with explicit source-unit identity'
            projects.append(project(table, row))
        item = {key: row[key] for key in ['ledgerId', 'title', 'sourceId', 'identityBasis', 'nativeBundleId',
                                          'aliases', 'recordUnit', 'acceptedDisposition', 'duplicateOfLedgerId',
                                          'sources', 'sourceFields', 'caveats']}
        item.update({'disposition': disposition, 'reason': reason,
                     'runtimeId': identities.get(row['ledgerId']),
                     'duplicateOfRuntimeId': identities.get(row['duplicateOfLedgerId'])})
        if 'supplementaryPublicGeometryEvidence' in row:
            item['supplementaryPublicGeometryEvidence'] = row['supplementaryPublicGeometryEvidence']
        ledger.append(item)
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects),
              'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger),
              'locatedRecords': 0}
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    source = next(item for item in table['sources'] if item['file'] == '2025-BPA-Transmission-Plan_Final.pdf')
    edition = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'label': LABEL,
        'reportingGroupId': SOURCE, 'reportingGroupName': GROUP,
        'publisher': 'Bonneville Power Administration', 'processAuthority': None,
        'publishedOn': None, 'retrievedOn': table['retrievedOn'],
        'source': {'file': source['file'], 'url': source['url'],
                   'locator': 'Sections 1.2.1, 2, 8–11; accepted 98-row named-work normalization ledger'},
        'sha256': source['sha256'],
        'geographicScope': 'BPA plan areas across Washington, Oregon, Idaho, western Montana, northern California and northwest Wyoming; not complete state or utility capital inventories.',
        'inventoryScope': '77 retained physical transmission work units in a 98-row plan normalization: 15 completed units, one cancelled unit and five repeated observations excluded. Bundles and named components retain accepted boundaries.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()],
        'limitations': [
            'Full scope refers to this declared plan normalization, not every BPA capital project or distinct engineering-project totals. This sample retains pending units explicitly.',
            'Lifecycle assertions belong to plan year 2025. The August 25, 2026 index update is not a row update or lifecycle change; publication day is unknown. Separate GERP material and GIS snapshots are supplementary evidence, not a live status feed.',
            'Native bundle identity is used only for unambiguous scope. Section/parent/component locators are not native engineering IDs; future-edition continuity requires explicit review.',
            'Repeated or shared bundles do not merge different components. P5470/P05470 is an accepted explicit alias; P04632 planned breaker and completed line remain distinct. Warner/Hilltop share a bundle but retain component identity.',
            'Conflicting and phased forecasts retain labeled source milestones, with unknown primary date. Need years are not service dates; estimated completion has unknown kind; no days or construction windows are invented.',
            'Runtime geometry and project centers are unknown. Public GERP pins/lines can represent existing facilities or partial scope; no center, centroid or proposed route is inferred from them.',
            'Owners remain unknown unless an exact assertion covers the whole unit. Publisher, sponsor, operator, customer and funder are not ownership defaults; joint BPA/PGE scope has no exclusive owner.',
            'P03259 remains retained with unknown lifecycle despite its elapsed table year. Explicit completed/cancelled units and repeated observations stay in the source ledger.',
        ],
    }
    dataset = {
        'schemaVersion': 2, 'mode': 'real', 'title': 'BPA 2025 Transmission Plan — ' + args.scope,
        'generatedAt': table['generatedAt'], 'projects': projects, 'sourceEditions': [edition],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                     'notes': [str(counts['pendingRows']) + ' accepted BPA plan units remain pending in this source snapshot.',
                               'Plan/component counts are not deduplicated engineering-project totals or complete state coverage.']},
    }
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'))
    sizes = {'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedUtf8Bytes': len(formatted.encode('utf-8'))}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(formatted)
    (args.output_dir / 'manifest.json').write_text(json.dumps(edition, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'row-ledger.json').write_text(json.dumps({
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'sources': table['sources'],
        'indexUpdatedOn': table['indexUpdatedOn'], 'lifecycleYear': table['lifecycleYear'],
        'identityPolicy': table['identityPolicy'], 'counts': counts, 'payloadSizes': sizes, 'rows': ledger,
    }, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'README.md').write_text(f'''# BPA 2025 Transmission Plan — {args.scope}

Source-only Dataset version 2: {counts['sourceRows']} normalization rows = {counts['importedRecords']} imported + {counts['excludedRows']} excluded + {counts['pendingRows']} pending; zero failed or located. The accepted complete inventory has 77 retained transmission-work units. The exclusions preserve 15 completed, one cancelled and five repeated observations; source units are not deduplicated engineering-project totals.

The connection sample contains Silver Creek, Sno-King, Keeler P05449, Bonanza and Pearl P04974. Silver Creek retains a year-level service forecast; Sno-King retains a need year with unknown service date. The other three preserve conflicting/phased forecasts as source-labeled milestones and leave the primary date unknown. No owner, construction interval or geometry is inferred. Public GERP feature citations remain evidence only.

Lifecycle assertions use plan year 2025 with source-edition meaning. The index update is August 25, 2026; it is not a record update, publication day or live status claim. Native/source-locator identity, component boundaries and accepted aliases are explicit in the ledger. Coordinator provider connection is required before full transcription proceeds.

`manifest.json` matches the embedded edition. `row-ledger.json` records every mapping/disposition and all 14 public source hashes. Payload: {sizes['compactUtf8Bytes']} compact UTF-8 bytes / {sizes['formattedUtf8Bytes']} formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/bpa-plan/extract.py --scope {args.scope}`. Originals remain ignored under `inputs/originals/F27-bpa-plan/` in the reusable UI worktree. No originals or images are committed; coordinator owns runtime validation and integration.
''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **sizes}))


if __name__ == '__main__':
    main()
