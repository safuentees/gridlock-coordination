#!/usr/bin/env python3
"""Normalize the preserved public June 2026 RSP list; never read restricted material."""
import argparse
from collections import Counter
from datetime import date, datetime, timezone
import hashlib
import json
from pathlib import Path
import re

import openpyxl
from openpyxl.utils import column_index_from_string

KEY = 'iso-ne-rsp'
EDITION = '2026-06'
LABEL = 'ISO New England RSP — June 2026'
GROUP = 'ISO New England RSP'
FILE = 'final_rsp_project_list_jun_2026.xlsx'
URL = 'https://www.iso-ne.com/static-assets/documents/100037/final_rsp_project_list_jun_2026.xlsx'
SHA = 'adfe05f5c0f24e260acca3b10c692785b4298a2067fa2e79efcf1d079953190d'
SHEET = 'RSP_sortable'
SAMPLE = {'1938', '1934', '1928', '1914', '1813', '1758'}
OWNERS = {'Eversource': 'isone-eversource', 'Central Maine Power Company': 'isone-cmp', 'Vermont Electric Power Company': 'isone-velco', 'National Grid, USA': 'isone-national-grid-usa', 'Rhode Island Energy': 'isone-ri-energy', 'Versant Power': 'isone-versant', 'United Illuminating Company': 'isone-ui'}
STATUSES = {'planned': 'planned', 'under construction': 'under-construction', 'proposed': 'unknown'}


def text(value):
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return str(value).strip()


def source(locator):
    return {'file': FILE, 'locator': locator, 'url': URL}


def source_date(cell, label, kind='unknown', monthly=False):
    value = cell.value
    if isinstance(value, (datetime, date)):
        precision = 'month' if monthly or ('m' in cell.number_format.lower() and 'd' not in cell.number_format.lower()) else 'day'
        return {'value': value.strftime('%Y-%m') if precision == 'month' else value.strftime('%Y-%m-%d'), 'precision': precision, 'kind': kind, 'label': label}
    return {'value': None, 'precision': 'unknown', 'kind': kind, 'label': label}


def make_project(cells, number, native_id):
    cell = lambda column: cells[column_index_from_string(column) - 1]
    value = lambda column: text(cell(column).value)
    owner_name = value('E')
    raw_status = value('BF')
    description = value('J') or f'RSP project {native_id}'
    milestone = source_date(cell('H'), 'Projected in-service month/year', 'in-service', monthly=True)
    notes = [f"Major project context: {value('I') or 'Not stated'}; original source category: {value('B') or 'Not stated'}. These fields do not merge individual listed work items."]
    if raw_status.lower() == 'proposed':
        notes.append('Source status is Proposed; planning/approval maturity is unresolved. No committed construction is inferred.')
    milestones = [{'field': 'ProjectedInService', 'date': milestone, 'evidence': [source(f'{SHEET}!H{number}; header H1 states month/year')]}]
    for column, field, label in [('BH', 'PPAApproval', 'PPA (I.3.9) approval'), ('BI', 'TCAApproval', 'TCA approval')]:
        date_value = source_date(cell(column), label)
        if date_value['value'] is not None:
            milestones.append({'field': field, 'date': date_value, 'evidence': [source(f'{SHEET}!{column}{number}') ]})
        elif value(column):
            notes.append(f'{label} as published: {value(column)}; not a dated approval.')
    volts = set()
    for group in re.findall(r'((?:\d+(?:\.\d+)?\s*/\s*)*\d+(?:\.\d+)?)\s*kV\b', description, re.I):
        volts.update(float(token) for token in re.findall(r'\d+(?:\.\d+)?', group))
    owner = {'id': OWNERS[owner_name], 'name': owner_name, 'identityScope': 'source', 'evidence': [source(f'{SHEET}!E{number}; Primary Equipment Owner')]} if owner_name in OWNERS else None
    if owner is None and owner_name:
        notes.append('Source owner label is retained; identity mapping requires review.')
    return {
        'id': f'{KEY}:{native_id}', 'utilityId': KEY, 'sourceId': native_id, 'sponsor': owner_name,
        'name': description, 'description': value('A') or '', 'status': raw_status, 'voltageKv': sorted(volts),
        'date': milestone, 'buildWindow': None, 'location': None,
        'sources': [source(f'{SHEET}!A{number}:DE{number}; current status BF; headers row 1')], 'notes': notes,
        'inventory': {
            'sourceKey': KEY, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': 'transmission-project', 'recordUnit': 'project', 'lifecycle': STATUSES[raw_status.lower()],
            'lifecycleAsOf': EDITION, 'lifecycleDateMeaning': 'source-edition', 'sourceUpdatedOn': None,
            'sourceState': value('D'), 'sourceLocation': None, 'owner': owner, 'parentProgramId': None,
            'aliases': [], 'workType': value('A'), 'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['No native coordinates are supplied. State and named facilities do not establish project centers.'],
            'milestones': milestones,
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != SHA:
        raise ValueError('Input differs from the qualified June 2026 public edition; qualify a refresh separately.')
    workbook = openpyxl.load_workbook(args.input, read_only=True, data_only=True)
    projects, ledger, seen = [], [], set()
    excluded = Counter()
    for number, cells in enumerate(workbook[SHEET].iter_rows(min_row=2, max_row=1025, max_col=109), 2):
        native_id = str(cells[2].value)
        if not isinstance(cells[2].value, int) or native_id in seen:
            raise ValueError(f'Invalid or duplicate project identity at row {number}')
        seen.add(native_id)
        raw_status = text(cells[column_index_from_string('BF') - 1].value)
        normalized = (raw_status or '').lower()
        entry = {'sourceRow': number, 'nativeId': native_id, 'locator': f'{SHEET}!A{number}:DE{number}', 'rawStatus': raw_status, 'rawState': text(cells[3].value), 'rawOwner': cells[4].value}
        if args.scope == 'sample' and native_id not in SAMPLE:
            entry.update(disposition='pending', reason='Outside the first six-record connection sample.')
        elif normalized in ['in-service', 'cancelled']:
            entry.update(disposition='excluded', reason=normalized)
            excluded[normalized] += 1
        elif normalized in STATUSES:
            projects.append(make_project(cells, number, native_id))
            entry.update(disposition='imported', reason='Nonterminal listed transmission work item.', projectId=f'{KEY}:{native_id}')
        else:
            raise ValueError(f'Unqualified lifecycle at row {number}: {raw_status}')
        ledger.append(entry)
    workbook.close()
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(excluded.values()), 'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    manifest = {
        'sourceKey': KEY, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': KEY, 'reportingGroupName': GROUP,
        'publisher': 'ISO New England', 'processAuthority': 'ISO New England regional system planning',
        'publishedOn': '2026-07-09', 'retrievedOn': '2026-09-30', 'source': source(f'{SHEET}!A2:DE1025; headers row 1'), 'sha256': SHA,
        'geographicScope': 'Regional system planning list across Connecticut, Massachusetts, Maine, New Hampshire, Rhode Island and Vermont; partial public inventory, not all local transmission work.',
        'inventoryScope': 'Individual RSP listed work items with latest status Planned, Under Construction or Proposed. In-service and cancelled rows excluded. Duplicate formatted/topical sheets are not additional inventory; asset-condition list is outside this source.',
        'scope': args.scope, 'counts': counts, 'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(excluded.items())],
        'limitations': ['No native coordinates; every record remains unlocated and outside proximity matching.', 'Projected in-service dates have month precision; stored Excel days do not supply exact milestone days.', 'Proposed is retained with unknown normalized lifecycle; elapsed dates do not establish completion.', 'Owner identities are source-scoped and do not establish cross-source corporate equivalence.', 'Native Project IDs identify listed work items; major project names do not establish deduplication.', 'Public source is attributed for private project analysis; no dataset-specific open reuse license identified.'],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': f'{LABEL} — {args.scope} inventory', 'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest], 'coverage': {'processed': len(projects), 'skipped': sum(excluded.values()), 'failed': 0, 'notes': ['Source-specific RSP inventory; all coordinates remain unknown.']}}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for filename, data in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', {'sourceKey': KEY, 'editionId': EDITION, 'sourceSha256': SHA, 'scope': args.scope, 'counts': counts, 'rows': ledger})]:
        (args.output_dir / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps(counts))


if __name__ == '__main__':
    main()
