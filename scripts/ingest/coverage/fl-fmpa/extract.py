#!/usr/bin/env python3
"""Extract the accepted public FMPA Table II-1; no network, rendering or source edits."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

import pdfplumber

SOURCE = 'fl-fmpa'
EDITION = '2026-04-01'
GROUP = 'Florida FMPA municipal additions'
LABEL = 'FMPA 2026–2035 site plan — April 1, 2026'
FILE = 'FMPA Municipal Power.pdf'
URL = 'https://files.tcrpc.org/Programs_Services/Energy%20Planning/FMPA%20Municipal%20Power.pdf?t=202609031318390'
SHA = 'dce5c6ec57b598c3bf98013881f64751914ef960253f839fa4e6b341f348a4af'
POLICY = json.loads(Path(__file__).with_name('policy.json').read_text())
SAMPLE = {tuple(entry) for entry in POLICY['sampleEntries']}
CONTEXT = {(entry['groupSlug'], entry['childOrdinal']): entry for entry in POLICY['planningContextDecisions']}


def ref(locator):
    return {'file': FILE, 'locator': locator, 'url': URL}


def extract_rows(path):
    if hashlib.sha256(path.read_bytes()).hexdigest() != SHA:
        raise ValueError('PDF differs from accepted public copy; qualify a new edition before importing.')
    rows = []
    with pdfplumber.open(path) as pdf:
        page = pdf.pages[66]
        table = page.find_tables()[0]
        # Five merged City rows contain 59 aligned work-item baselines.
        # Per-cell baseline matching preserves genuine blanks instead of shifting values.
        for group_row, group in zip(table.rows[3:], POLICY['groups']):
            cells = group_row.cells
            descriptions = page.crop(cells[1]).extract_text_lines()
            values = [page.crop(cell).extract_words() for cell in cells[2:]]
            if len(descriptions) != group['workItems']:
                raise ValueError(f'Unexpected work-item count for {group["name"]}')
            for child, line in enumerate(descriptions, 1):
                scalar = [' '.join(word['text'] for word in words if abs(word['top'] - line['top']) < 1)
                          for words in values]
                rows.append({'group': group['name'], 'groupSlug': group['slug'], 'childOrdinal': child,
                    'description': line['text'], 'mva': scalar[0], 'voltage': scalar[1],
                    'circuit': scalar[2], 'estimatedInServiceDate': scalar[3]})
    return rows


def source_id(row):
    return f'{EDITION}:ii-1:{row["groupSlug"]}:{row["childOrdinal"]:02}'


def locator(row):
    return f'PDF p.67 / printed II-1; Table II-1; {row["group"]}; child entry {row["childOrdinal"]} (top to bottom)'


def kind(row):
    return 'planning-context' if (row['groupSlug'], row['childOrdinal']) in CONTEXT else 'transmission-project'


def project(row):
    uid = source_id(row)
    match = re.fullmatch(r'(0[1-9]|1[0-2])/(\d{4})', row['estimatedInServiceDate'])
    if not match:
        raise ValueError(f'Unresolved displayed month forecast at {uid}')
    timing = {'value': f'{match[2]}-{match[1]}', 'precision': 'month',
              'kind': 'in-service', 'label': 'Estimated in-service date'}
    citation = ref(locator(row))
    notes = [
        'Municipal participant: ' + row['group'] + '; the City column is reporting context, not a qualified asset owner.',
        'Planned/proposed addition in the April 1, 2026 report; individual approval and construction status are not supplied. An elapsed forecast does not establish completion.',
        'Source MVA: ' + (row['mva'] or '(blank)') + '; source Circuit: ' + (row['circuit'] or '(blank)') + '. Values are preserved as reported, not project counts or savings.',
        'Source Voltage: ' + (row['voltage'] or '(blank)') + '; estimated in-service: ' + row['estimatedInServiceDate'] + '.',
        'One table work item is retained even when its description names several assets. The source reference is an edition-specific locator, not a native engineering ID.',
    ]
    sources = [citation]
    context = CONTEXT.get((row['groupSlug'], row['childOrdinal']))
    if context:
        notes.append(context['reason'] + ' Retained as planning context, outside transmission-qualified comparisons.')
        if row['groupSlug'] == 'beaches':
            sources.append(ref('PDF p.23 / printed 2-5; section 2.2.1, Beaches Energy Services distribution delivery at 26.4 kV'))
    elif row['groupSlug'] == 'kua' and row['childOrdinal'] in {1, 2, 3, 5, 7, 8}:
        notes.append('This source table lists physical substation work; its transmission versus distribution serving function is not explicit. Retain that scope uncertainty.')
    if row['groupSlug'] == 'ocala' and row['childOrdinal'] == 6:
        notes.append('MVA and Circuit cells are genuinely blank; preceding-row values are not substituted.')
    # Voltage column alone supplies normalized voltage, never the MVA column.
    voltage = sorted({float(value) for value in re.findall(r'\d+(?:\.\d+)?', row['voltage']) if float(value) > 0})
    return {'id': SOURCE + ':' + uid, 'utilityId': SOURCE, 'sourceId': uid, 'sponsor': row['group'],
        'name': row['description'], 'description': row['description'],
        'status': 'Planned and Proposed Transmission Additions', 'voltageKv': voltage,
        'date': timing, 'buildWindow': None, 'location': None, 'sources': sources, 'notes': notes,
        'inventory': {'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL,
            'reportingGroupName': GROUP, 'recordKind': kind(row), 'recordUnit': 'project',
            'identityBasis': 'source-locator', 'lifecycle': 'planned', 'lifecycleAsOf': EDITION,
            'lifecycleDateMeaning': 'source-edition', 'owner': None, 'parentProgramId': None,
            'aliases': [], 'workType': 'Planned/proposed municipal addition',
            'sourceState': None, 'sourceLocation': 'Source City / participant: ' + row['group'],
            'sourceUpdatedOn': None, 'milestones': [{'field': 'Estimated In-Service Date', 'date': timing, 'evidence': [citation]}],
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['Named facilities and City/participant labels are descriptive context. No coordinates, geometry or precision are supplied; no center or route is inferred.']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    rows = extract_rows(args.input)
    projects, ledger = [], []
    for row in rows:
        imported = args.scope == 'full' or (row['groupSlug'], row['childOrdinal']) in SAMPLE
        entry = {'sourceId': source_id(row), 'locator': locator(row), 'raw': row,
                 'recordKind': kind(row), 'disposition': 'imported' if imported else 'pending',
                 'reason': 'Accepted planned/proposed work item.' if imported else 'Retained work item outside the six-record connection sample.'}
        if imported:
            record = project(row)
            projects.append(record)
            entry['projectId'] = record['id']
        ledger.append(entry)
    counts = {'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': 0,
              'failedRows': 0, 'pendingRows': len(rows) - len(projects), 'locatedRecords': 0}
    group_counts = dict(Counter(row['group'] for row in rows))
    manifest = {'sourceKey': SOURCE, 'editionId': EDITION, 'label': LABEL,
        'reportingGroupId': SOURCE, 'reportingGroupName': GROUP, 'publisher': 'Florida Municipal Power Agency',
        'processAuthority': 'Florida Public Service Commission', 'publishedOn': EDITION, 'retrievedOn': '2026-09-30',
        'source': ref('PDF pp.1–2 report date; PDF p.67 / printed II-1, Table II-1, all five City groups'), 'sha256': SHA,
        'geographicScope': 'Partial Florida municipal ARP participant scope: five named reporting groups, not statewide coverage.',
        'inventoryScope': 'Every aligned work-item line in Table II-1 planned/proposed transmission additions, with explicit distribution/study context retained separately. Five grouped City cells are not extra projects.',
        'scope': args.scope, 'counts': counts, 'exclusions': [], 'limitations': [
            'Actual public TCRPC copy is cited. The PSC endpoint was unavailable; byte equality with that copy is not asserted.',
            'The report supplies a 69 kV-and-above table boundary. Blank voltage is not an exclusion; no additional threshold is imposed.',
            'All qualified owners, coordinates, geometry and construction windows remain unknown. Municipal participant and publisher are not substituted for asset owner.',
            'Forecasts preserve month precision. Planned/proposed is a combined table heading, not an individual approval or construction claim; elapsed dates do not establish completion.',
            'Source references identify edition-specific table/group/child positions, not native engineering IDs or cross-edition continuity. Compound descriptions are not split further.',
            'Ten exact distribution/study work items retain planning context. Potentially mixed KUA substation work retains explicit scope uncertainty.',
            'No cross-source identity evidence supports deduplication; totals count source work items, not distinct national engineering projects.',
            'Original binary remains outside Git; public availability is not a redistribution-license claim.',
        ]}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': LABEL + ' — ' + args.scope + ' inventory',
        'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
        'coverage': {'processed': len(projects), 'skipped': 0, 'failed': 0,
            'notes': [f'Five participant groups; 59 work items; {counts["pendingRows"]} pending.',
                      'All source forecasts are months. No coordinates, owners or construction windows inferred.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': EDITION, 'sourceSha256': SHA, 'scope': args.scope,
        'counts': counts, 'groupedCityRows': 5, 'groupWorkItemCounts': group_counts,
        'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
        'completeScopeRecordKindCounts': dict(Counter(kind(row) for row in rows)), 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': EDITION, 'scope': args.scope, 'records': len(projects),
        'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
        'measurement': 'Source-only Dataset2 UTF-8 JSON; aggregate/export envelope can be larger.',
        'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for filename, content in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / filename).write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'counts': counts, 'groupCounts': group_counts, 'kinds': row_ledger['recordKindCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
