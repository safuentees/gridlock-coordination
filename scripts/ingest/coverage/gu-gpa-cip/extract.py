#!/usr/bin/env python3
"""Normalize the accepted GPA capital-budget factual table without geographic/date inference."""
import argparse
import json
from collections import Counter
from pathlib import Path

SOURCE = 'gu-gpa-cip'
GROUP = 'Guam Power Authority'
LABEL = 'GPA FY2026–2027 CIP details — August 26, 2025 board presentation'


def project(table, row):
    facts = row['facts']
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': GROUP, 'name': row['title'], 'description': facts['description'],
        'status': table['rawStatus'], 'voltageKv': facts['voltageKv'],
        'date': {'value': None, 'precision': 'unknown', 'kind': 'unknown', 'label': 'Project milestone not published'},
        'buildWindow': None, 'location': None, 'sources': row['sources'], 'notes': facts['notes'],
        'inventory': {
            'sourceKey': SOURCE, 'editionId': table['editionId'], 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'identityBasis': 'source-locator', 'recordKind': row['recordKind'],
            'lifecycle': 'planned', 'lifecycleAsOf': table['meetingOn'], 'lifecycleDateMeaning': 'source-edition',
            'owner': None, 'sourceState': None, 'sourceLocation': facts['sourceLocation'], 'sourceUpdatedOn': None,
            'milestones': [], 'parentProgramId': None, 'aliases': facts['aliases'], 'workType': facts['workType'],
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown', 'locationAssumptions': [],
        },
    }


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/gu-gpa-cip')
    args = parser.parse_args()
    table = json.loads((script_dir / 'source-records.json').read_text())
    if args.scope == 'full' and any(not row['excluded'] and row['facts'] is None for row in table['rows']):
        raise SystemExit('Full transcription is pending; connect the six-record sample before the remaining accepted records.')
    selected = set(table['sampleIds']) if args.scope == 'sample' else {row['sourceId'] for row in table['rows'] if not row['excluded']}
    projects, ledger = [], []
    for row in table['rows']:
        if row['excluded']:
            disposition, reason = 'excluded', row['mappingReason']
        elif row['sourceId'] not in selected or row['facts'] is None:
            disposition, reason = 'pending', 'Accepted retained budget entry outside this sample snapshot' if row['facts'] else 'Accepted retained budget entry; production transcription pending'
        else:
            disposition, reason = 'imported', row['mappingReason']
            projects.append(project(table, row))
        ledger.append({
            'sourceId': row['sourceId'], 'section': row['section'], 'rowWithinSection': row['rowWithinSection'],
            'title': row['title'], 'identityBasis': 'source-locator', 'nativeEngineeringProjectId': None,
            'recordKind': row['recordKind'], 'disposition': disposition, 'reason': reason, 'sources': row['sources'],
        })
    counts = {
        'sourceRows': len(ledger), 'importedRecords': len(projects),
        'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger), 'failedRows': 0,
        'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0,
    }
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    original = table['sources'][0]
    edition = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'label': LABEL,
        'reportingGroupId': SOURCE, 'reportingGroupName': GROUP, 'publisher': GROUP,
        'processAuthority': 'Consolidated Commission on Utilities', 'publishedOn': None,
        'retrievedOn': table['retrievedOn'],
        'source': {'file': original['file'], 'url': original['url'],
                   'locator': 'August 26, 2025 CCU presentation, Proposed FY2026–2027 CIP Budget Details, slides 36–40; packet pages 57–61; PDF pages 725–729'},
        'sha256': original['sha256'],
        'geographicScope': 'Guam Power Authority budget-work scope on Guam; not a complete current Guam project register.',
        'inventoryScope': 'All 44 named detail-budget rows in sections A–E/G: 27 retained source work units (two transmission, 14 capital context, 11 planning context) and 17 exclusions. Broad programs are not deduplicated engineering projects.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()],
        'limitations': [
            'Full scope, when complete, refers only to the 44 named detail rows: A4+B4+C1+D1+E5+G29. Summary-only F/H/I categories, totals and other public IRP/annual-report work are outside this boundary.',
            'Budget programs and named upgrades can overlap. Category C and G.8 both describe substation/transmission improvements; no silent merging or deduplicated-project count is claimed.',
            'Curated section/row locators are not native engineering IDs. Circuit and transformer labels are asset aliases; future editions need an explicit identity crosswalk.',
            'Planned lifecycle describes the August 26, 2025 proposed-budget source. Budget adoption does not prove individual engineering authorization, current construction or completion.',
            'FY2026 and FY2027 are spending years, not milestones or construction windows. Every retained primary date, construction window and construction start remains unknown.',
            'Every retained owner and center/native geometry remains unknown. GPA is the reporting/budget sponsor, not an inferred complete asset owner; locality text is not coordinates.',
            'Only G.6 and G.15 establish one explicit 115 kV value. Combined 34.5/115 kV protection programs remain context, and ambiguous circuit/transformer/regulator titles are not inferred transmission work.',
            'Repeated earlier August 21 presentations inside the legislative packet are not additional source entries. The primary source is the August 26 presentation preserved in the public legislative mirror.',
            'The meeting date is established; the original public posting date and individual row update dates are not.',
        ],
    }
    dataset = {
        'schemaVersion': 2, 'mode': 'real', 'title': 'GPA capital-budget detail inventory — ' + args.scope,
        'generatedAt': table['generatedAt'], 'projects': projects, 'sourceEditions': [edition],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                     'notes': [str(counts['pendingRows']) + ' accepted budget entries remain pending in this source snapshot.',
                               'The complete declared detail-table scope is not the complete capital budget or current Guam project universe.']},
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'))
    sizes = {'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedUtf8Bytes': len(formatted.encode('utf-8'))}
    (args.output_dir / 'dataset.json').write_text(formatted)
    (args.output_dir / 'manifest.json').write_text(json.dumps(edition, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'row-ledger.json').write_text(json.dumps({
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'sources': table['sources'],
        'counts': counts, 'payloadSizes': sizes, 'rows': ledger,
    }, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'README.md').write_text(f'''# GPA capital-budget detail inventory — {args.scope}

Source-only Dataset version 2: {counts['sourceRows']} named budget entries = {counts['importedRecords']} imported + {counts['excludedRows']} excluded + {counts['pendingRows']} pending; zero failed and zero located. The accepted full boundary contains 27 retained source work units, not a complete current Guam register or deduplicated engineering-project total.

The six-record sample covers C.1, G.6, G.15, G.1, G.7 and G.12. Broad protection/control programs remain capital context; unresolved transformer/line roles remain planning context. Only the two explicit 115 kV line upgrades carry a numeric voltage. Every owner, center, native geometry, construction interval and project milestone stays unknown. FY2026/FY2027 spending columns are not project dates; the August 26, 2025 budget-plan lifecycle does not establish current status.

Section/row identities are reproducible source locators, not native engineering IDs. Programs may overlap and are not silently merged. Summary-only F/H/I categories, other GPA documents and repeated earlier presentations remain outside this declared detail-table scope. Sponsor does not supply ownership evidence; sourceState is null because no geographic state column is supplied.

`manifest.json` matches the embedded source edition. `row-ledger.json` reconciles all 44 named rows and records the exact public packet hash. Payload: {sizes['compactUtf8Bytes']} compact UTF-8 bytes / {sizes['formattedUtf8Bytes']} formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/gu-gpa-cip/extract.py --scope {args.scope}`. The cited factual transcription is beside the adapter. The original public PDF stays ignored under `inputs/originals/F27-gu-gpa/` in the UI worktree. Coordinator owns provider connection and runtime validation; no worker checks were run.
''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **sizes}))


if __name__ == '__main__':
    main()
