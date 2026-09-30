#!/usr/bin/env python3
"""Emit the accepted public SDG&E TPR snapshot from hash-pinned source cells."""
import argparse
from collections import Counter
from datetime import date, datetime
import hashlib
import json
from pathlib import Path
import re

import openpyxl

SOURCE = 'sdge-tpr'
EDITION = '2026-07'
RELEASE = '2026-07-01'
RETRIEVED = '2026-09-30'
GENERATED = '2026-09-30T00:00:00Z'
LABEL = 'SDG&E public July 2026 TPR portfolio'
GROUP = 'SDG&E public TPR filing'
PUBLISHER = 'San Diego Gas & Electric'
SHEET = 'Project List'
FILE = 'JULY26-SDG&E-Public - Resolution E-5252 TPR Process Data.xlsx'
LOCAL_FILE = 'JULY26-SDGE-Public-Resolution-E-5252-TPR-Process-Data.xlsx'
URL = 'https://www.sdge.com/sites/default/files/JULY26-SDG%26E-Public%20-%20Resolution%20E-5252%20TPR%20Process%20Data.xlsx'
SHA256 = '0e800beb097adc26be9669c841808ced2c18542c9a499465144b41399c3dd157'
SAMPLE_ROWS = {20, 12, 121, 334, 342, 356}
BUDGET_ROWS = {121, 161, 163}
EMPTY = {'', 'NA', 'N/A', 'TBD', 'Multiple'}
# No person fields, hidden metadata, formulas, or full workbook rows enter output.
COLUMNS = ('A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'Y', 'Z', 'AA', 'AB',
           'AD', 'AE', 'AF', 'AG', 'AH', 'BC', 'BE', 'BF', 'BG', 'BH', 'BI', 'BK', 'BM')
ARTIFACTS = [
    {'file': FILE, 'localFile': LOCAL_FILE, 'url': URL, 'bytes': 297133, 'sha256': SHA256},
    {'file': 'sdge-tpr-process.html', 'localFile': 'sdge-tpr-process.html',
     'url': 'https://www.sdge.com/sdge-tpr-process', 'bytes': 80878,
     'sha256': '9a77fbfd955b0962a3f6aff2f746311f14bd3cf610d1fc26f37568537aceb8c0'},
    {'file': 'cpuc-tpr-process.html', 'localFile': 'cpuc-tpr-process.html',
     'url': 'https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/transmission-project-review-process',
     'bytes': 72849, 'sha256': '1e3dfc920b9586e9cf380886574a1bf22daaee9596830e947d2543e31c715a15'},
]


def raw(value):
    return value.date().isoformat() if isinstance(value, datetime) else value


def text(value):
    value = raw(value)
    return '' if value is None else str(value).strip()


def present(value):
    return text(value) not in EMPTY


def display(value):
    # Excel numeric cells retain 15 significant decimal digits; exact cell values
    # also remain in the source ledger rather than being rounded to money units.
    return format(value, '.15g') if isinstance(value, float) else text(value)


def ref(locator):
    return {'file': FILE, 'locator': locator, 'url': URL}


def date_field(value, label, kind='in-service'):
    value = text(value)
    try:
        parsed = date.fromisoformat(value).isoformat() if re.fullmatch(r'\d{4}-\d{2}-\d{2}', value) else None
    except ValueError:
        parsed = None
    return {'value': parsed, 'precision': 'day' if parsed else 'unknown', 'kind': kind, 'label': label}


def source_id(row):
    return text(row['AD']) if present(row['AD']) else f"project-list-row-{int(row['A']):03d}"


def exclusion(row):
    # Summary precedence keeps operational summaries out of operational-child counts.
    if text(row['B']).startswith('[Programmatic]'):
        return 'program-summary'
    return {'Operational': 'operational', 'Canceled': 'canceled'}.get(text(row['BC']))


def lifecycle(row):
    status = text(row['BC'])
    if status.startswith('Construction'):
        return 'under-construction'
    if status == 'On Hold':
        return 'on-hold'
    return 'planned' if status in ('Planning', 'Permitting') or status.startswith('Engineering') else 'unknown'


def record_kind(row):
    return 'transmission-project' if text(row['G']).startswith(('Transmission Line', 'Substation')) else 'capital-project-context'


def voltage(row):
    values = set()
    line = text(row['AA'])
    if re.fullmatch(r'\d+(?:\.\d+)?(?:\s*\|\s*\d+(?:\.\d+)?)*', line):
        values.update(float(part.strip()) for part in line.split('|'))
    # AB is mixed capacity/voltage text. Only a numeric group explicitly labeled
    # kV supplies voltages; a number labeled MVA is never promoted to kV.
    for field in (line, text(row['AB'])):
        for group in re.findall(r'((?:\d+(?:\.\d+)?\s*[/|]\s*)*\d+(?:\.\d+)?)\s*kV\b', field, re.I):
            values.update(float(value) for value in re.findall(r'\d+(?:\.\d+)?', group))
    return sorted(value for value in values if value > 0)


def identities(row):
    aliases = [f"Source project ID (AD), raw: {raw(row['AD'])}"]
    if present(row['AE']):
        aliases.append('Parent work order: ' + text(row['AE']))
    if present(row['AG']):
        aliases.append('Budget code: ' + text(row['AG']))
    parts = [part.strip() for part in text(row['AH']).split('|')]
    if len(parts) == 4:
        for label, value in zip(('project ID', 'parent work order', 'budget code'), parts[1:]):
            if present(value):
                aliases.append(f'Former {label} reported {parts[0]}: {value}')
    return aliases


def project(row, number, description, extra_notes):
    service = date_field(row['BG'], 'Current projected or actual in-service date')
    start = date_field(row['BE'], 'Construction start: actual or expected', 'unknown')
    original = date_field(row['BF'], 'Original planned in-service date')
    notes = []
    if not service['value']:
        notes.append('Current projected or actual in-service value: ' + (text(row['BG']) or 'blank') + '.')
    if service['value'] and service['value'] < RELEASE:
        notes.append('The service milestone precedes this source edition while the published lifecycle remains nonterminal; both source assertions are retained.')
    if lifecycle(row) == 'under-construction' and start['value'] and start['value'] > RELEASE:
        notes.append('The published construction status and actual-or-expected start after the edition date conflict; neither is silently corrected.')
    if number in BUDGET_ROWS:
        notes.append('Distribution blanket-budget context overlaps its separately excluded program summary; this is not an independent known engineering asset or an additive project cost.')
    if not present(row['AD']):
        notes.append('Most-specific project ID is ' + text(row['AD']) + '; the source-row locator is not a native engineering ID. Future-edition continuity requires an explicit crosswalk.')
    change = [part.strip() for part in text(row['AH']).split('|')]
    if len(change) == 4 and present(change[0]):
        if any(present(value) for value in change[1:]):
            notes.append('Source identifier-change history is preserved as aliases; it does not establish a whole-record update or an automatic duplicate merge.')
        else:
            notes.append('Identifier-change field reports ' + change[0] + ' but no former identifiers; no identity change is inferred.')
    notes.append(f"Voltage fields: transmission (AA) {text(row['AA']) or 'blank'} kV; substation/transformer (AB) {text(row['AB']) or 'blank'} (mixed MVA/kV field).")
    for col, label in [('BK', 'Original projected cost or range'), ('BM', 'Current projected total or actual final cost')]:
        notes.append(f'{label} ($000): {display(row[col]) or "blank"}.')
    notes.append('Cost fields may overlap parent/child or program scopes and are not additive or shared-corridor savings.')
    milestones = [
        {'field': 'Construction Start Date (actual or expected)', 'date': start,
         'evidence': [ref(f"'{SHEET}'!BE{number}; 'Definitions'!D57:G57")]},
        {'field': 'Original Planned In-Service Date', 'date': original,
         'evidence': [ref(f"'{SHEET}'!BF{number}; 'Definitions'!D58:G58")]},
    ]
    for col, field in [('BE', 'Construction start'), ('BF', 'Original planned in-service')]:
        if not date_field(row[col], field)['value']:
            notes.append(f'{field} source value: {text(row[col]) or "blank"}.')
    notes.extend(extra_notes)
    inventory = {
        'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL,
        'reportingGroupName': GROUP, 'recordKind': record_kind(row),
        'lifecycle': lifecycle(row), 'lifecycleAsOf': RELEASE, 'lifecycleDateMeaning': 'source-edition',
        'owner': None, 'identityBasis': 'native-id' if present(row['AD']) else 'source-locator',
        'sourceState': None, 'sourceLocation': text(row['E']) if text(row['E']) not in ('', 'NA', 'N/A') else None,
        'sourceUpdatedOn': None, 'milestones': milestones,
        'parentProgramId': text(row['AE']) if present(row['AE']) else None,
        'aliases': identities(row), 'workType': text(row['G']) or None,
        'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
        'locationAssumptions': ['Public latitude and longitude cells are blank; no center, coordinate reference system or accuracy is inferred.'],
    }
    if number not in BUDGET_ROWS:
        inventory['recordUnit'] = 'project'
    native_id = source_id(row)
    return {
        'id': SOURCE + ':' + native_id, 'utilityId': SOURCE, 'sponsor': PUBLISHER, 'sourceId': native_id,
        'name': text(row['B']), 'description': description, 'status': text(row['BC']),
        'voltageKv': voltage(row), 'date': service, 'buildWindow': None, 'location': None,
        'sources': [ref(f"'{SHEET}'!A{number}:CO{number}; headers row 3"),
                    ref("'Definitions'!D25:G25, D28:G29, D31:G34, D57:G59, D63:G65")],
        'notes': notes, 'inventory': inventory,
    }


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + '\n')


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--source-dir', type=Path, default=root / 'inputs/originals/F27-ca-sdge-tpr')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/sdge-tpr')
    args = parser.parse_args()
    for source in ARTIFACTS:
        data = (args.source_dir / source['localFile']).read_bytes()
        if len(data) != source['bytes'] or hashlib.sha256(data).hexdigest() != source['sha256']:
            raise SystemExit('Source differs from the accepted public edition: ' + source['localFile'])
    descriptions = json.loads((script_dir / 'descriptions.json').read_text())
    record_notes = json.loads((script_dir / 'record-notes.json').read_text())
    workbook = openpyxl.load_workbook(args.source_dir / LOCAL_FILE, read_only=True, data_only=True)
    sheet = workbook[SHEET]
    rows = []
    for number, values in enumerate(sheet.iter_rows(min_row=4, max_row=370, max_col=93, values_only=True), 4):
        row = {column: raw(values[openpyxl.utils.column_index_from_string(column)-1]) for column in COLUMNS}
        if row['A'] != number - 3 or not text(row['B']):
            raise SystemExit(f'Unexpected declared row identity at {number}; source review required.')
        rows.append((number, row))
    workbook.close()
    retained = [(number, row) for number, row in rows if exclusion(row) is None]
    if args.scope == 'full' and any(str(number) not in descriptions for number, _ in retained):
        raise SystemExit('Full source scope is not yet transcribed; connect the six-record sample before completing descriptions.')
    selected = SAMPLE_ROWS if args.scope == 'sample' else {number for number, _ in retained}
    projects, ledger = [], []
    excluded = Counter()
    for number, row in rows:
        reason = exclusion(row)
        if reason:
            disposition = 'excluded'
            excluded[reason] += 1
        elif number not in selected:
            disposition, reason = 'pending', 'Accepted nonterminal source unit outside the initial six-record connection sample.'
        else:
            disposition, reason = 'imported', 'Accepted nonterminal source unit; no inferred owner, location or construction window.'
            projects.append(project(row, number, descriptions[str(number)], record_notes.get(str(number), [])))
        entry = {
            'sourceRow': number, 'sourceRowNo': row['A'], 'name': text(row['B']),
            'locator': f"'{SHEET}'!A{number}:CO{number}", 'disposition': disposition, 'reason': reason,
            'rawFields': {column: row[column] for column in COLUMNS if column not in ('A', 'B')},
        }
        if not exclusion(row):
            entry.update(projectId=SOURCE + ':' + source_id(row), identityBasis='native-id' if present(row['AD']) else 'source-locator', recordKind=record_kind(row))
        ledger.append(entry)
    counts = {
        'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(excluded.values()),
        'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0,
    }
    limitations = [
        'Complete declared public expenditure-bounded workbook: 367 rows, 137 retained units and 230 exclusions. This is not a statewide or deduplicated engineering-project inventory.',
        'Exclude 40 labeled program summaries before 187 other Operational and three Canceled rows. Parent project counts are not additional rows or evidence of missing projects.',
        'Three unprefixed distribution blanket budgets remain context with overlapping program/cost scope; optional recordUnit is omitted. Other non-transmission capital work remains context.',
        'July 1, 2026 is the source edition release, not a known row update, extraction time or live status. Actual/expected starts and projected/actual service dates retain their labels and conflicts.',
        'Most-specific native IDs, parent work orders and budget codes are distinct. Missing project IDs use explicit source locators; future-edition continuity needs reviewed crosswalks.',
        'All public latitude/longitude cells are blank. Source city/county text is not geocoded; centers, native geometry, coordinate role/accuracy and asset owners remain unknown.',
        'The utility is the reporting sponsor, not evidenced asset owner. Project Manager is a person field and is not extracted. Original workbook and hidden metadata remain outside runtime and Git.',
        'Construction start is actual or expected; no complete construction interval is established. On Hold and nonterminal status remain unchanged when milestones pass.',
        'Cost fields are in $000 with potentially overlapping parent/child/program scope. No additive project total, ranking input or realized/hypothetical coordination benefit is derived.',
    ]
    edition = {
        'sourceKey': SOURCE, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': SOURCE,
        'reportingGroupName': GROUP, 'publisher': PUBLISHER, 'processAuthority': 'California Public Utilities Commission',
        'publishedOn': RELEASE, 'retrievedOn': RETRIEVED,
        'source': ref("'Project List'!A4:CO370; headers row 3; 'Definitions'!D2:G2, D31:G34, D57:G59, D63:G65"),
        'sha256': SHA256,
        'geographicScope': 'SDG&E public FERC transmission capital filing; source geography may span multiple cities/counties. Not all California transmission work.',
        'inventoryScope': '137 nonterminal row units after summary-first exclusions; 93 explicit line/substation units and 44 capital-project-context units. Three unprefixed blanket budgets remain overlapping context.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(excluded.items())],
        'limitations': limitations,
    }
    dataset = {
        'schemaVersion': 2, 'mode': 'real', 'title': LABEL + ' — ' + args.scope,
        'generatedAt': GENERATED, 'projects': projects, 'sourceEditions': [edition],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                     'notes': [f"{counts['pendingRows']} accepted nonterminal source units remain pending; all 230 exclusions are reconciled.",
                               'Source edition and public expenditure boundary do not establish present construction status or statewide completeness.']},
    }
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    sizes = {'compactUtf8Bytes': len(compact.encode()), 'formattedUtf8Bytes': len(formatted.encode())}
    quality = {
        'sourceKey': SOURCE, 'editionId': EDITION, 'scope': args.scope, 'sampleExcelRows': sorted(SAMPLE_ROWS),
        'sampleIds': [SOURCE + ':' + source_id(row) for number, row in rows if number in SAMPLE_ROWS],
        'acceptedFullRecordKinds': dict(Counter(record_kind(row) for _, row in retained)),
        'acceptedFullLifecycles': dict(Counter(lifecycle(row) for _, row in retained)),
        'importedRecordKinds': dict(Counter(p['inventory']['recordKind'] for p in projects)),
        'importedLifecycles': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
        'primaryDatePrecisionCounts': dict(Counter(p['date']['precision'] for p in projects)),
        'unknownOwnerRecords': len(projects), 'unknownLocationRecords': len(projects),
        'blanketBudgetExcelRows': sorted(BUDGET_ROWS),
        'pastCurrentDateWithNonterminalStatusExcelRows': [number for number, row in retained if (date_field(row['BG'], '')['value'] or '9999') < RELEASE],
        'constructionStatusWithFutureStartExcelRows': [number for number, row in retained if lifecycle(row) == 'under-construction' and date_field(row['BE'], '')['value'] and date_field(row['BE'], '')['value'] > RELEASE],
        'additionalScopeCaveats': [{'sourceRow': int(number), 'notes': notes} for number, notes in record_notes.items()],
        'normalizationMethod': 'Hash-pinned public source fields plus concise factual descriptions; source-only normalization, no source acquisition, owner/geographic inference or application checks.',
        'payloadSizes': sizes,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(formatted)
    write_json(args.output_dir / 'manifest.json', edition)
    write_json(args.output_dir / 'row-ledger.json', {'sourceKey': SOURCE, 'editionId': EDITION, 'scope': args.scope, 'sourceSha256': SHA256, 'counts': counts, 'payloadSizes': sizes, 'rows': ledger})
    write_json(args.output_dir / 'source-catalog.json', {'sourceKey': SOURCE, 'editionId': EDITION, 'captureMeaning': 'Original downloaded bytes, never derived page text or a confidential workbook.', 'sources': ARTIFACTS})
    write_json(args.output_dir / 'source-quality.json', quality)
    scope_note = 'All 137 accepted units are emitted in source order; the six connected sample records keep their values and identities.' if args.scope == 'full' else 'Full payload is not emitted in this sample snapshot; 131 accepted records remain pending.'
    (args.output_dir / 'README.md').write_text(f'''# SDG&E public July 2026 TPR — {args.scope}

Source version 2: 367 declared rows = {counts['importedRecords']} imported + 230 excluded + {counts['pendingRows']} pending. No failed, located or evidenced-owner records. Full accepted scope is 137 source units (93 transmission / 44 capital context), not statewide or deduplicated engineering coverage.

The six diagnostics are Excel rows 12, 20, 121, 334, 342 and 356. Native/source-locator IDs, parent orders, budget codes, raw unknown dates and source status conflicts remain distinct. Row 121 is an overlapping distribution blanket budget, not an independent known asset; its recordUnit is omitted, as for blanket budgets at rows 161 and 163 in the full source. Full descriptions preserve supporting-equipment categories, historical program text, prospective ownership and the Ash/Jamacha title-scope conflicts without automatic corrections or merges. All coordinates/owners/native geometry and construction windows remain null. July 1 is the edition date, not per-row freshness.

`manifest.json` is the same edition embedded in `dataset.json`; `row-ledger.json` preserves all 367 public dispositions and whitelisted field values. `source-catalog.json` records hashes of the preserved original workbook and index HTML. No person fields, hidden metadata or originals are included. `source-quality.json` records accepted/full counts and source conflicts.

Actual dataset payload: {sizes['compactUtf8Bytes']:,} compact / {sizes['formattedUtf8Bytes']:,} formatted UTF-8 bytes. {scope_note} Coordinator owns runtime validation and loader integration; no worker checks were run.

Reproduce with `python3 scripts/ingest/coverage/sdge-tpr/extract.py --scope {args.scope}` using ignored originals under `inputs/originals/F27-ca-sdge-tpr/`. Hash mismatch stops generation; no network fetch or alternate-source fallback occurs.
''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **sizes}))


if __name__ == '__main__':
    main()
