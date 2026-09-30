#!/usr/bin/env python3
"""Normalize the accepted Hawaiian Electric featured-topic snapshot and cited factual table."""
import argparse
import json
from collections import Counter
from pathlib import Path

SOURCE = 'hi-heco-featured'
GROUP = 'Hawaiian Electric featured projects'
LABEL = 'Hawaiian Electric featured project pages — September 30, 2026 snapshot'


def reference(source, locator):
    return {'file': source['file'], 'url': source['url'], 'locator': locator}


def project(table, row):
    facts = row['facts']
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        **{key: facts[key] for key in ['name', 'sponsor', 'description', 'status', 'voltageKv', 'date', 'notes']},
        'buildWindow': None, 'location': None, 'sources': row['sources'],
        'inventory': {
            'sourceKey': SOURCE, 'editionId': table['editionId'], 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'identityBasis': 'source-locator', 'recordKind': row['recordKind'],
            **{key: facts[key] for key in ['lifecycle', 'lifecycleAsOf', 'lifecycleDateMeaning', 'sourceState',
                                         'sourceLocation', 'sourceUpdatedOn', 'aliases', 'workType', 'milestones']},
            'owner': None, 'parentProgramId': None, 'constructionStart': None,
            'nativeGeometry': None, 'centerRole': 'unknown', 'locationAssumptions': [],
        },
    }


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/hi-heco-featured')
    args = parser.parse_args()
    table = json.loads((script_dir / 'source-records.json').read_text())
    if args.scope == 'full' and any(not row['excluded'] and row['facts'] is None for row in table['rows']):
        raise SystemExit('Full transcription pending. Connect the two-record sample before continuing the accepted handoff.')
    selected = set(table['sampleIds']) if args.scope == 'sample' else {row['sourceId'] for row in table['rows'] if not row['excluded']}
    projects, ledger = [], []
    for row in table['rows']:
        if row['excluded']:
            disposition, reason = 'excluded', row['exclusionReason']
        elif row['sourceId'] not in selected or row['facts'] is None:
            disposition, reason = 'pending', 'Accepted retained topic outside this sample snapshot' if row['facts'] else 'Accepted retained topic; production transcription pending'
        else:
            disposition = 'imported'
            reason = {'transmission-project': 'Explicit transmission/subtransmission improvement',
                      'capital-project-context': 'Network capital program, not separately enumerated engineering projects',
                      'planning-context': 'Unresolved mixed line-rebuild and microgrid planning context'}[row['recordKind']]
            projects.append(project(table, row))
        ledger.append({'topicOrdinal': row['topicOrdinal'], 'sourceId': row['sourceId'], 'title': row['title'],
                       'identityBasis': 'source-locator', 'nativeEngineeringProjectId': None,
                       'recordKind': row['recordKind'], 'disposition': disposition, 'reason': reason, 'sources': row['sources']})
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects),
              'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger), 'failedRows': 0,
              'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    index = table['sources'][0]
    edition = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'label': LABEL,
        'reportingGroupId': SOURCE, 'reportingGroupName': GROUP, 'publisher': 'Hawaiian Electric',
        'processAuthority': None, 'publishedOn': None, 'retrievedOn': table['retrievedOn'],
        'source': reference(index, 'Investing in the Future; all seven featured topic headings and linked project pages'),
        'sha256': index['sha256'],
        'geographicScope': 'Featured Hawaiian Electric topics on Oahu, Hawaii Island and Maui; retained topics concern Oahu and Hawaii Island. Not complete Hawaii or utility coverage.',
        'inventoryScope': 'Seven featured topics: two transmission improvements, one capital network program, one unresolved planning context and three excluded completed/generation/storage topics. Workstreams and phases are not extra records.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()],
        'limitations': [
            'The featured index is not a complete utility or statewide planned-project inventory; broader Hawaii coverage remains a gap.',
            'Page slugs are source locators, not native engineering project IDs. Dockets identify proceedings; future-edition identity continuity requires review.',
            'All retained project owners and geometry are unknown. Publisher/sponsor, controller ownership and named places do not establish project ownership or coordinates.',
            'Forecast month/year precision is preserved. No construction window, actual start or in-service date is inferred from a schedule or program horizon.',
            'Kalaeloa replacement-pole counts conflict: 21 in the index, 20 on the detail page.',
            'North Kohala remains unresolved planning context. Its closed storage procurement does not establish cancellation of the wider concept; the June 30, 2026 annual update reports reevaluation.',
            'Koa Ridge is excluded because its detail page explicitly reports completion, despite the older future-tense index summary.',
            'Conditional REZ alternatives and other planning/distribution examples are outside this seven-topic boundary.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': 'Hawaiian Electric featured projects — ' + args.scope,
               'generatedAt': table['generatedAt'], 'projects': projects, 'sourceEditions': [edition],
               'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                            'notes': [str(counts['pendingRows']) + ' accepted featured topics remain pending in this source snapshot.',
                                      'Featured subset only; broader Hawaii planned-project inventory coverage remains incomplete.']}}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'))
    sizes = {'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedUtf8Bytes': len(formatted.encode('utf-8'))}
    (args.output_dir / 'dataset.json').write_text(formatted)
    (args.output_dir / 'manifest.json').write_text(json.dumps(edition, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'row-ledger.json').write_text(json.dumps({'sourceKey': SOURCE, 'editionId': table['editionId'],
        'sources': table['sources'], 'counts': counts, 'payloadSizes': sizes, 'rows': ledger}, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'README.md').write_text(f'''# Hawaiian Electric featured projects — {args.scope}

Source-only Dataset version 2: {counts['sourceRows']} featured topics = {counts['importedRecords']} imported + {counts['excludedRows']} excluded + {counts['pendingRows']} pending; zero failed or located. The complete accepted boundary contains four retained topics, not a complete utility or Hawaii inventory.

Page-slug identities are source locators, not native engineering IDs. Ownership and geometry stay unknown. Kalaeloa's explicit subtransmission scope, month-level service forecast and 20/21 pole-count conflict remain visible. North Kohala remains unresolved planning context despite its closed storage procurement. No construction windows or actual construction are inferred from forecasts.

`manifest.json` matches the embedded source edition. `row-ledger.json` records all seven dispositions and nine public source hashes. Payload: {sizes['compactUtf8Bytes']} compact UTF-8 bytes / {sizes['formattedUtf8Bytes']} formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/hi-heco-featured/extract.py --scope {args.scope}`. Cited factual decisions live beside the script. Originals remain ignored under `inputs/originals/F27-hi-heco-projects/` in the UI worktree. No HTML/PDF originals or images are committed. Coordinator owns validation and provider integration.
''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **sizes}))


if __name__ == '__main__':
    main()
