#!/usr/bin/env python3
"""Normalize the accepted, cited Railbelt text transcription; no PDF geometry inference."""
import argparse
import json
from pathlib import Path

SOURCE = 'ak-aea-rstp'
LABEL = 'AEA 2050 Railbelt Strategic Transmission Plan — February 26, 2026'
GROUP = 'AEA Railbelt strategic plan'
SINGLE_OWNERS = {
    'map-B': ('AEA', 'Alaska Energy Authority'),
    'map-D': ('AEA', 'Alaska Energy Authority'),
    'map-F': ('HEA', 'Homer Electric Association'),
    'map-I': ('CEA', 'Chugach Electric Association'),
    'map-J': ('CEA', 'Chugach Electric Association'),
}


def reference(source, locator):
    return {'file': source['file'], 'locator': locator, 'url': source['url']}


def row_references(table, row):
    pages = ', '.join(str(page) for page in row['mainPages'])
    references = [reference(table['sources'][0], f"PDF/printed pages {pages}; section {row['parentSection']}; accepted leaf {row['sourceId']}")]
    if row['sourceMapKey']:
        references.append(reference(table['sources'][1], f"PDF page 19 / printed page 34; System Improvement Projects table; map key {row['sourceMapKey']}"))
    return references


def project(table, row):
    facts, source_id = row['facts'], row['sourceId']
    sources = facts['sources']
    companion_refs = [source for source in sources if source['file'] == table['sources'][1]['file']]
    owner = None
    expected = SINGLE_OWNERS.get(source_id)
    if expected and facts['rawOwnerLabel'] == expected[0] and companion_refs:
        owner = {'id': SOURCE + '-' + expected[0].lower(), 'name': expected[1], 'identityScope': 'source', 'evidence': companion_refs}
    scheduled = source_id == 'map-B' and facts['completionText'] == 'August 2032'
    date = {'value': '2032-08' if scheduled else None, 'precision': 'month' if scheduled else 'unknown',
            'kind': 'unknown', 'label': 'Scheduled project completion' if scheduled else 'Project milestone not stated'}
    notes = [f"Source priority: {row['priority']}; priority does not establish construction approval.",
             f"Parent source section: {row['parentSection']}; this heading is not an additional project.",
             'Source locator identity; not a native engineering project ID. Later editions require explicit identity review.']
    if facts['rawOwnerLabel']:
        notes.append('Companion table owner label: ' + facts['rawOwnerLabel'] + '.')
        if owner is None:
            notes.append('The composite owner label does not establish one asset owner identity.')
    if facts['rawTimeline']:
        notes.append('Companion table Project Timeline: ' + facts['rawTimeline'] + '; no absolute date inferred from this number or range.')
    notes.extend(facts['sourceNotes'])
    return {
        'id': SOURCE + ':' + source_id, 'utilityId': SOURCE, 'sourceId': source_id, 'sponsor': None,
        'name': facts['name'], 'description': facts['description'],
        'status': 'Partially funded; scheduled completion August 2032' if scheduled else row['priority'].capitalize() + ' priority strategic improvement; construction maturity not stated',
        'voltageKv': facts['voltageKv'], 'date': date, 'buildWindow': None, 'location': None, 'sources': sources, 'notes': notes,
        'inventory': {
            'sourceKey': SOURCE, 'editionId': table['editionId'], 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': row['recordKind'], 'recordUnit': facts['recordUnit'], 'identityBasis': 'source-locator',
            'lifecycle': 'planned' if scheduled else 'unknown', 'lifecycleAsOf': table['editionId'], 'lifecycleDateMeaning': 'source-edition',
            'owner': owner, 'sourceState': None, 'sourceLocation': facts['sourceLocation'], 'sourceUpdatedOn': None,
            'milestones': [{'field': 'Project Timeline footnote **', 'date': date, 'evidence': companion_refs}] if scheduled else [],
            'parentProgramId': None, 'aliases': [row['sourceMapKey']] if row['sourceMapKey'] else [],
            'workType': 'Strategic transmission improvement', 'constructionStart': None,
            'nativeGeometry': None, 'centerRole': 'unknown', 'locationAssumptions': [],
        },
    }


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/ak-aea-rstp')
    args = parser.parse_args()
    table = json.loads((script_dir / 'source-records.json').read_text())
    if args.scope == 'full' and any(not row['excluded'] and row['facts'] is None for row in table['rows']):
        raise SystemExit('Full transcription is pending; connect the six-record sample before continuing the accepted handoff.')
    selected = set(table['sampleIds']) if args.scope == 'sample' else {row['sourceId'] for row in table['rows'] if not row['excluded']}
    projects, ledger = [], []
    for row in table['rows']:
        if row['excluded']:
            disposition, reason = 'excluded', row['exclusionReason']
        elif row['sourceId'] not in selected or row['facts'] is None:
            disposition, reason = 'pending', 'Accepted retained leaf; awaiting full transcription after sample connection'
        else:
            disposition, reason = 'imported', 'Accepted cited transmission improvement' if row['recordKind'] == 'transmission-project' else 'Mixed transmission/distribution context'
            projects.append(project(table, row))
        ledger.append({'sourceId': row['sourceId'], 'identityBasis': 'source-locator', 'parentSection': row['parentSection'],
                       'nativeMapKey': row['sourceMapKey'], 'nativeEngineeringProjectId': None, 'curatedLabel': row['curatedLabel'],
                       'disposition': disposition, 'reason': reason, 'sources': row_references(table, row)})
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    edition = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'label': LABEL, 'reportingGroupId': SOURCE, 'reportingGroupName': GROUP,
        'publisher': 'Alaska Energy Authority', 'processAuthority': None, 'publishedOn': table['editionId'], 'retrievedOn': table['retrievedOn'],
        'source': reference(table['sources'][0], 'Chapter 3, sections 3.2.1–3.4.5, PDF/printed pages 27–37; all 28 child entries'),
        'sha256': table['sources'][0]['sha256'],
        'geographicScope': 'Alaska Railbelt strategic transmission text inventory; not complete Alaska or national coverage.',
        'inventoryScope': '28 chapter-3 leaves: 25 transmission improvements, one mixed transmission/distribution context, two excluded standalone BESS entries. Twelve parent groups and repeated presentations are not additional records.',
        'scope': args.scope, 'counts': counts, 'exclusions': [{'reason': 'Standalone battery energy storage', 'count': counts['excludedRows']}],
        'limitations': [
            'Curated map/section locators are not native engineering project IDs; future-edition continuity is unproven.',
            'Strategic priority is not construction maturity. All lifecycle values remain unknown except the explicitly scheduled CIPLink proposal.',
            'Every record is unlocated. Named endpoints, owner labels and map illustrations supply no coordinate evidence here.',
            'Composite owners remain unknown; evidenced single owners have source identity scope only.',
            'Timeline ranges and the 2050 study horizon are not exact milestones or construction windows. CIPLink completion is month precision, unknown date kind.',
            'A/B cost-row allocation, alternative path scope, endpoint wording and 138/139 kV conflicts remain unresolved; costs are not normalized.',
            'Companion source: Statewide Railbelt Energy Vision, cover February 2026, PDF page 19 / printed page 34. SHA256 ' + table['sources'][1]['sha256'] + '.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': 'AEA Railbelt strategic transmission — ' + args.scope,
               'generatedAt': table['generatedAt'], 'projects': projects, 'sourceEditions': [edition],
               'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0, 'notes': [str(counts['pendingRows']) + ' accepted leaves remain pending in this source snapshot.']}}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'))
    payload_sizes = {'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedUtf8Bytes': len(formatted.encode('utf-8'))}
    (args.output_dir / 'dataset.json').write_text(formatted)
    (args.output_dir / 'manifest.json').write_text(json.dumps(edition, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'row-ledger.json').write_text(json.dumps({'sourceKey': SOURCE, 'editionId': table['editionId'], 'sources': table['sources'], 'counts': counts, 'payloadSizes': payload_sizes, 'rows': ledger}, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'README.md').write_text(f'''# AEA Railbelt strategic transmission — {args.scope}\n\nSource-only Dataset version 2: {counts['sourceRows']} chapter-3 leaves = {counts['importedRecords']} imported + {counts['excludedRows']} standalone BESS exclusions + {counts['pendingRows']} pending; zero failed and zero mapped records. Full accepted scope is 26 retained improvements/context records, not statewide completeness.\n\nAll IDs are explicit source locators, not native engineering project IDs. Unknown conceptual maturity, composite owners, cost/voltage/endpoint conflicts and conditional alternatives stay visible. CIPLink alone has an explicit scheduled completion (August 2032, month precision, unknown date kind). No construction windows or coordinates are inferred.\n\n`manifest.json` matches the embedded source edition; `row-ledger.json` records every disposition and both official PDF hashes. Payload: {payload_sizes['compactUtf8Bytes']} compact UTF-8 bytes; {payload_sizes['formattedUtf8Bytes']} formatted UTF-8 bytes.\n\nReproduce using `python3 scripts/ingest/coverage/ak-aea-rstp/extract.py --scope {args.scope}`. Source transcription and exact citations live beside that script. Originals stay ignored under `inputs/originals/F27-ak-railbelt/` in the UI worktree. No original PDF, images or long report passages are included. Coordinator owns runtime validation and integration.\n''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **payload_sizes}))


if __name__ == '__main__':
    main()
