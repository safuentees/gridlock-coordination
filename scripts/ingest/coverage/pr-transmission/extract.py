#!/usr/bin/env python3
"""Normalize only accepted Table 1 of the public August 2026 Puerto Rico filing."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

import pdfplumber

SOURCE = 'pr-transmission'
EDITION = '2026-08-27-table1'
AS_OF = '2026-08'
GROUP = 'Puerto Rico public transmission hardening'
LABEL = 'Puerto Rico August 2026 stabilization report — Table 1'
FILE = '20260827-MI20240005-Monthly-Report-public.pdf'
URL = 'https://energia.pr.gov/wp-content/uploads/sites/7/2026/09/20260827-MI20240005-Motion-to-Submit-August-2026-Monthly-Collaborative-Report-in-Compliance-with-Resolutions-and-Orders-of-March-2028-2025-and-February-18-2026-and-Request-for-Clarification-and-Exhibits.pdf'
SHA = 'd1bc3b2e3a42fca0f41c5d2ad52b136700cf5ae580d048b213a484f4e24b5cc5'
POLICY = json.loads(Path(__file__).with_name('policy.json').read_text())
SAMPLE = set(POLICY['sampleRows'])
COMPLETE = set(POLICY['completedOrClosed'])
ENERGIZED = set(POLICY['energizedNoRemainingScope'])
INCREMENTAL = set(POLICY['incrementalDateFromNarrative'])
PHASE = {row: phase for phase, rows in POLICY['retainByLifecycle'].items() for row in rows}
MONTHS = {name: i + 1 for i, name in enumerate(('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'))}
EXCLUSION_COMPLETE = 'Explicitly completed or closed'
EXCLUSION_ENERGIZED = 'Energized with no remaining work identified in this row'


def text(cells):
    return re.sub(r'\s+', ' ', ' '.join(str(value) for value in cells if value)).strip()


def extract_rows(path):
    if hashlib.sha256(path.read_bytes()).hexdigest() != SHA:
        raise ValueError('PDF differs from the accepted public copy; qualify a new edition before importing.')
    rows = []
    with pdfplumber.open(path) as pdf:
        for index in range(11, 15):
            # Several small nested tables share borders; only the table headed # is inventory.
            tables = [table for table in pdf.pages[index].extract_tables()
                      if table and table[0] and table[0][0] == '#']
            if len(tables) != 1:
                raise ValueError(f'Unexpected Table 1 structure on PDF page {index + 1}')
            table = tables[0]
            start, completion = [i for i, heading in enumerate(table[0]) if heading and heading.startswith('Expected')]
            for cells in table[1:]:
                values = {'projectTitle': text(cells[2:start]),
                    'expectedConstructionStart': text(cells[start:completion]),
                    'expectedConstructionCompletion': text(cells[completion:completion + 1]),
                    'projectStatus': text(cells[completion + 1:])}
                if cells[0] and cells[0].isdigit():
                    rows.append({'rowNumber': int(cells[0]), 'pdfPages': [index + 1], 'printedPages': [index - 6],
                                 'fundingSource': text(cells[1:2]), **values})
                elif not cells[0] and rows:
                    # Split-cell and cross-page text continues the preceding numbered row.
                    prior = rows[-1]
                    for key, value in values.items():
                        if value:
                            prior[key] = (prior[key] + ' ' + value).strip()
                    if any(values.values()) and index + 1 not in prior['pdfPages']:
                        prior['pdfPages'].append(index + 1)
                        prior['printedPages'].append(index - 6)
                elif cells[0] and cells[0].startswith('NFC'):
                    continue  # Funding acronym legend, not a numbered work package.
                else:
                    raise ValueError(f'Unresolved Table 1 row on PDF page {index + 1}')
    if [row['rowNumber'] for row in rows] != list(range(1, 33)):
        raise ValueError('Numbered source rows do not reconcile to the accepted 1–32 enumeration.')
    return rows


def ref(locator):
    return {'file': FILE, 'locator': locator, 'url': URL}


def source_id(row):
    return f'2026-08-27:table1:{row["rowNumber"]:02}'


def locator(row):
    pdf = ','.join(map(str, row['pdfPages']))
    printed = ','.join(map(str, row['printedPages']))
    return f'Exhibit 1, Table 1, row {row["rowNumber"]}; PDF pp.{pdf} / printed pp.{printed}'


def month(value, label):
    if value in {'-', 'TBD', ''}:
        return {'value': None, 'precision': 'unknown', 'kind': 'unknown', 'label': label}
    match = re.fullmatch(r'([A-Z][a-z]{2})-(\d{2})', value)
    if not match or match[1] not in MONTHS:
        raise ValueError(f'Unresolved construction-month value {value!r}')
    return {'value': f'20{match[2]}-{MONTHS[match[1]]:02}', 'precision': 'month', 'kind': 'unknown', 'label': label}


def record_kind(number):
    return 'capital-project-context' if number in POLICY['capitalContext'] else 'transmission-project'


def exclusion(number):
    return EXCLUSION_COMPLETE if number in COMPLETE else EXCLUSION_ENERGIZED if number in ENERGIZED else None


def project(row):
    number, uid = row['rowNumber'], source_id(row)
    citation = ref(locator(row))
    start = month(row['expectedConstructionStart'], 'Expected construction start (table)')
    completion = month(row['expectedConstructionCompletion'], 'Expected construction completion (table)')
    timing = {'value': '2026-10', 'precision': 'month', 'kind': 'unknown', 'label': 'Expected incremental hardening construction completion'} if number in INCREMENTAL else dict(completion, label='Expected remaining construction completion')
    milestones = [{'field': 'Expected Construction Start Date', 'date': start, 'evidence': [citation]},
        {'field': 'Expected Construction Completion Date (table)', 'date': completion, 'evidence': [citation]}]
    notes = [
        'LUMA is the reporting/operator context; a qualified asset owner is not established by this table.',
        'Funding Source: ' + row['fundingSource'] + '. Agency labels and numeric funding tokens are not native project IDs or asset owners.',
        'Source expected construction start: ' + row['expectedConstructionStart'] + '; expected construction completion: ' + row['expectedConstructionCompletion'] + '. These are construction forecasts, not in-service dates.',
        'Dates preserve month precision. No day-based construction start or interval is inferred.',
        'The source reference identifies this edition/table/row, not a native engineering ID. Repeated line numbers do not merge work packages.',
    ]
    if number in INCREMENTAL:
        notes.append('The original line was energized; additional physical hardening remains planned. The explicit October 2026 narrative forecast applies to remaining work; historical table forecasts are preserved separately.')
        milestones.extend([
            {'field': 'Remaining hardening completion (status narrative)', 'date': timing, 'evidence': [citation]},
            {'field': 'Original line energization (status narrative)', 'date': {'value': '2025-12', 'precision': 'month', 'kind': 'in-service', 'label': 'Original line energization'}, 'evidence': [citation]},
        ])
    if number == 20:
        notes.append('The source row continues from PDF page 13 to 14. Its continuation is part of this same work package.')
    if number == 21:
        notes.append('The source changed this scope from structure replacement to critical repair. It remains capital context, outside transmission-qualified comparisons.')
    if number in {21, 22}:
        notes.append('Construction was not completed, but the row does not establish how much began; lifecycle remains unknown.')
    if number in {23, 24, 25, 26}:
        notes.append('Partial FID completion establishes remaining work; FIDs are not separate project records. Q1 FY2027 remains source narrative, without an invented exact date.')
    if number in {14, 15}:
        notes.append('Awaiting reactivation is retained as on-hold; dash forecast cells remain unknown.')
    if number == 32:
        notes.append('Out-of-Service Segment is the source project title, not a completed-project status. Under design is planned; TBD completion remains unknown.')
    return {'id': SOURCE + ':' + uid, 'utilityId': SOURCE, 'sourceId': uid, 'sponsor': 'LUMA (reporting operator)',
        'name': row['projectTitle'], 'description': row['projectTitle'] + ' — ' + row['projectStatus'],
        'status': row['projectStatus'], 'voltageKv': [], 'date': timing, 'buildWindow': None, 'location': None,
        'sources': [citation], 'notes': notes,
        'inventory': {'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': record_kind(number), 'recordUnit': 'project', 'identityBasis': 'source-locator',
            'lifecycle': PHASE[number], 'lifecycleAsOf': AS_OF, 'lifecycleDateMeaning': 'source-edition',
            'owner': None, 'parentProgramId': None, 'aliases': [],
            'workType': 'Critical repair (changed scope)' if number == 21 else 'Transmission line hardening',
            'sourceState': None, 'sourceLocation': 'Source project title: ' + row['projectTitle'],
            'sourceUpdatedOn': None, 'milestones': milestones, 'constructionStart': None,
            'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['Named lines and terminals are source context. The selected table supplies no coordinates, geometry or precision; no route or center is inferred.']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    rows = extract_rows(args.input)
    projects, ledger = [], []
    exclusions = Counter()
    for row in rows:
        number = row['rowNumber']
        entry = {'sourceId': source_id(row), 'locator': locator(row), 'raw': row}
        reason = exclusion(number)
        if reason:
            exclusions[reason] += 1
            entry.update(disposition='excluded', reason=reason)
        elif args.scope == 'sample' and number not in SAMPLE:
            entry.update(disposition='pending', reason='Retained work package outside the six-record connection sample.',
                         recordKind=record_kind(number), lifecycle=PHASE[number])
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', reason='Remaining Table 1 work package retained.',
                         projectId=record['id'], recordKind=record_kind(number), lifecycle=PHASE[number])
        ledger.append(entry)
    counts = {'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()),
        'failedRows': 0, 'pendingRows': sum(r['disposition'] == 'pending' for r in ledger), 'locatedRecords': 0}
    manifest = {'sourceKey': SOURCE, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': SOURCE,
        'reportingGroupName': GROUP, 'publisher': 'LUMA, Genera and PREPA; public filing via Puerto Rico Energy Bureau',
        'processAuthority': 'Puerto Rico Energy Bureau', 'publishedOn': '2026-08-27', 'retrievedOn': '2026-09-30',
        'source': ref('Exhibit 1 Table 1, PDF pp.12–15 / printed pp.5–8, numbered rows1–32; date on PDF pp.1,7'),
        'sha256': SHA, 'geographicScope': 'Partial Puerto Rico physical-hardening program, not territory-wide completeness.',
        'inventoryScope': 'Every numbered Table 1 work package; completed/closed and energized-only scopes excluded, incremental remaining work retained. Critical-repair scope remains capital context.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': key, 'count': value} for key, value in exclusions.items()],
        'limitations': [
            'August 2026 is the monthly source edition; August 27 is filing/publication, not a per-row status-change day or live status.',
            'Rows4/5/7 retain incremental physical work despite original energization; the summary count of thirteen completed/energized original scopes does not override remaining-work evidence.',
            'Funding tokens and repeated line numbers are not engineering IDs. Source references are edition/table/row locators without cross-edition continuity or cross-source deduplication.',
            'Expected construction months are not in-service milestones or day-based windows. Fiscal-quarter wording stays narrative; reverse historical table dates remain raw source evidence.',
            'All qualified owners, voltage, coordinates, geometry and construction windows are unknown. Reporting operator is not substituted for asset owner.',
            'Row21 changed from structure replacement to critical repair and remains capital context; rows21/22 retain unknown lifecycle despite incomplete-work language.',
            'The preceding eight descoped bullets, separate 51-segment maintenance program, vegetation, generation/storage and substation tables are outside the declared Table 1 inventory.',
            'Only public Table 1 is extracted; confidential comprehensive-plan material and legal contact details are not derived data. Public availability does not assert a redistribution license.',
        ]}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': LABEL + ' — ' + args.scope + ' inventory',
        'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
            'notes': [f'32 Table 1 rows; 10 exclusions; {counts["pendingRows"]} retained rows pending.',
                      'No owner, voltage, geometry or day construction window inferred. Original public filing remains unchanged.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': EDITION, 'sourceSha256': SHA, 'scope': args.scope,
        'counts': counts, 'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
        'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
        'completeRetainedRecordKindCounts': dict(Counter(record_kind(n) for n in PHASE)),
        'completeRetainedLifecycleCounts': dict(Counter(PHASE.values())), 'rows': ledger}
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
    print(json.dumps({'counts': counts, 'kinds': row_ledger['recordKindCounts'], 'lifecycles': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
