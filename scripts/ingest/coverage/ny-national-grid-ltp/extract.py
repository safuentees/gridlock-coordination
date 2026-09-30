#!/usr/bin/env python3
"""Extract the accepted six-record historical NY LTP sample and complete row ledger."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

import pdfplumber

KEY = 'ny-national-grid-ltp'
EDITION = '2025-10-30'
LABEL = 'National Grid New York local plan — October 30, 2025'
GROUP = 'National Grid New York local plan'
FILE = 'national-grid-local-transmission-plan-2025.pdf'
URL = 'https://www.nationalgridus.com/media/pdfs/microsites/wholesale-interconnections/national_grid_local_transmission_plan_2025.pdf'
SHA = '5f13264b522f017649867bc9f217568935a80f2a648c2d851c8aaccdcba27a33'
FIELDS = ('Project Name', 'Scope', 'Project Driver', 'Firm / Non-Firm', 'Status of SIS', 'Status of Facilities Study', 'Article VII Status', 'Project Status', 'Expected In-Service Date')
PAGE_ROWS = {5: 4, 6: 4, 7: 3, 9: 5, 10: 5, 12: 4, 13: 4, 14: 5, 15: 4, 17: 4, 19: 6, 20: 3, 21: 4, 22: 4, 23: 6, 24: 4, 25: 4, 26: 5, 28: 4, 29: 4, 30: 3, 31: 3, 32: 3, 33: 4, 34: 2, 35: 2, 37: 4, 38: 3, 40: 4, 41: 4, 42: 3, 43: 3, 45: 4, 46: 5, 48: 4, 49: 3, 50: 3, 51: 3, 52: 3, 53: 3}
AREAS = ((5, 7, 'Frontier'), (9, 10, 'Southwest'), (12, 15, 'Genesee'), (17, 17, 'Finger Lakes'), (19, 26, 'Syracuse/Oswego/Cortland'), (28, 35, 'Northern'), (37, 38, 'Utica/Rome'), (40, 43, 'Mohawk'), (45, 46, 'Northeast'), (48, 53, 'Capital/Hudson Valley'))
TRANSMISSION_ROWS = {(7, 1), (13, 4), (14, 5), (24, 1), (25, 1), (29, 3), (42, 3), (50, 2)}
# Concise factual scope summaries; no PDF reproduction or inferred engineering scope.
SAMPLE_SUMMARIES = {
    (7, 1): 'Replace the 115 kV Lockport station with a greenfield breaker-and-a-half station and extend transmission lines to it.',
    (12, 4): 'Replace 34.5 kV circuit breaker R412.',
    (14, 5): 'Add transmission taps to a new distribution substation serving highway rest-stop EV charging.',
    (29, 3): 'Add approximately 9 miles of 115 kV transmission line from Indian River to a new four-breaker ring station at the existing Lyme tap; add a breaker and associated equipment at Indian River.',
    (31, 2): 'Replace Middle Road Substation with a new station arranged as a six-breaker ring.',
    (50, 2): 'Add a transmission loop from the 115 kV Front St–Rosa Rd line 11 to a new 115:13.2 kV substation.',
}
EXPECTED_STATUS = {'Planned': 90, 'Under Construction': 15, 'Concept': 28, 'N/A': 1, 'Initiated': 1, 'Application Deemed Complete': 1, 'In-Service': 12, 'Cancelled': 4}
TERMINAL = {'In-Service': 'explicit-in-service', 'Cancelled': 'explicit-cancelled'}


def text(value):
    return ' '.join((value or '').split())


def header_key(value):
    return ''.join(re.findall(r'[a-z0-9]+', text(value).lower()))


def source(page=None, row=None, fields=None):
    locator = 'PDF cover and 40 project tables on pages 5–53'
    if page is not None:
        locator = f'PDF page {page}'
        if row is not None:
            locator += f', project-table body row {row} (header excluded)'
        if fields:
            locator += '; ' + ', '.join(fields)
    return {'file': FILE, 'locator': locator, 'url': URL + (f'#page={page}' if page is not None else '')}


def source_id(page, row):
    return f'2025-p{page:03d}-r{row:02d}'


def record_kind(row):
    return 'transmission-project' if (row['page'], row['row']) in TRANSMISSION_ROWS else 'planning-context'


def lifecycle(status):
    return {'Planned': 'planned', 'Under Construction': 'under-construction', 'In-Service': 'in-service', 'Cancelled': 'cancelled'}.get(status, 'unknown')


def month_date(value):
    match = re.fullmatch(r'(0[1-9]|1[0-2])/(\d{4})', value)
    if not match:
        if value != 'N/A':
            raise ValueError(f'Unqualified expected-service value: {value!r}')
        return {'value': None, 'precision': 'unknown', 'kind': 'in-service', 'label': 'Expected in-service month/year'}
    return {'value': f'{match[2]}-{match[1]}', 'precision': 'month', 'kind': 'in-service', 'label': 'Expected in-service month/year'}


def voltage_values(value):
    # Read only explicit kV expressions; never use voltage as a type/eligibility threshold.
    values = set()
    for expression in re.findall(r'(?<![\w.])(\d+(?:\.\d+)?(?:\s*[-/:]\s*\d+(?:\.\d+)?)*)\s*kV\b', value, flags=re.I):
        values.update(float(number) for number in re.findall(r'\d+(?:\.\d+)?', expression))
    return sorted(number for number in values if number > 0)


def read_rows(path):
    rows = []
    with pdfplumber.open(path) as pdf:
        if len(pdf.pages) != 55:
            raise ValueError('The accepted source has 55 pages; qualify changed editions separately.')
        # Read the accepted table pages only; do not collect author/contact pages or map images.
        for page_number, expected_rows in PAGE_ROWS.items():
            tables = pdf.pages[page_number - 1].extract_tables()
            if len(tables) != 1 or len(tables[0]) != expected_rows + 1:
                raise ValueError(f'Project-table enumeration changed on page {page_number}.')
            table = tables[0]
            if [header_key(value) for value in table[0]] != [header_key(field) for field in FIELDS]:
                raise ValueError(f'Unexpected project-table header on page {page_number}.')
            area = next(name for first, last, name in AREAS if first <= page_number <= last)
            for body_row, cells in enumerate(table[1:], 1):
                if len(cells) != len(FIELDS):
                    raise ValueError(f'Unexpected cell count on page {page_number}, body row {body_row}.')
                values = dict(zip(FIELDS, (text(value) for value in cells)))
                if not values['Project Name'] or values['Project Status'] not in EXPECTED_STATUS:
                    raise ValueError(f'Unqualified name/status at page {page_number}, body row {body_row}.')
                month_date(values['Expected In-Service Date'])
                rows.append({'page': page_number, 'row': body_row, 'id': source_id(page_number, body_row), 'area': area, 'values': values})
    if len(rows) != 152 or Counter(row['values']['Project Status'] for row in rows) != EXPECTED_STATUS:
        raise ValueError('Qualified 152-row lifecycle enumeration changed.')
    return rows


def make_project(row):
    page, number, values = row['page'], row['row'], row['values']
    field_source = lambda *fields: source(page, number, fields)
    status = values['Project Status']
    kind = record_kind(row)
    date = month_date(values['Expected In-Service Date'])
    notes = [f"Project driver: {values['Project Driver']}; Firm / Non-Firm: {values['Firm / Non-Firm']}.",
             f"Study and permit context — SIS: {values['Status of SIS']}; Facilities Study: {values['Status of Facilities Study']}; Article VII: {values['Article VII Status']}."]
    if kind == 'planning-context':
        notes.append('Transmission-project type is unresolved under the conservative source qualification; this is not a finding that the work is non-transmission.')
    if lifecycle(status) == 'unknown':
        notes.append(f'Source project status is {status}; it does not establish an approved or under-construction lifecycle.')
    if (page, number) == (31, 2):
        notes.append('The permit-like phrase is in the source Project Status column; it is preserved without moving fields or inferring project approval.')
    aliases = sorted({f'Source queue reference: {identifier}' for identifier in re.findall(r'\bQ\d+\b', ' '.join(values.values()))})
    if (page, number) == (12, 4):
        aliases.append('Source circuit breaker: R412')
    if (page, number) == (50, 2):
        aliases.append('Source transmission line: Front St - Rosa Rd #11')
    return {
        'id': f"{KEY}:{row['id']}", 'utilityId': KEY, 'sourceId': row['id'], 'sponsor': None,
        'name': values['Project Name'], 'description': SAMPLE_SUMMARIES[(page, number)], 'status': status,
        'voltageKv': voltage_values(values['Project Name'] + ' ' + values['Scope']),
        'date': date, 'buildWindow': None, 'location': None,
        'sources': [field_source(*FIELDS)], 'notes': notes,
        'inventory': {
            'sourceKey': KEY, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': kind, 'recordUnit': 'project', 'identityBasis': 'source-locator',
            'lifecycle': lifecycle(status), 'lifecycleAsOf': EDITION, 'lifecycleDateMeaning': 'source-edition',
            'sourceUpdatedOn': None, 'sourceState': None, 'sourceLocation': f"Source planning area: {row['area']}",
            'owner': None, 'parentProgramId': None, 'aliases': aliases,
            'workType': None, 'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['The source has planning-area/place text but no native project coordinates. No center, route or planning-area centroid is inferred.'],
            'milestones': [{'field': 'Expected In-Service Date', 'date': date, 'evidence': [field_source('Expected In-Service Date')]}],
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != SHA:
        raise ValueError('Input differs from the accepted 2025-10-30 source; qualify a refresh separately.')
    rows = read_rows(args.input)
    ledger, projects, exclusions = [], [], Counter()
    for row in rows:
        values = row['values']
        reason = TERMINAL.get(values['Project Status'])
        entry = {'sourceId': row['id'], 'page': row['page'], 'bodyRow': row['row'], 'source': source(row['page'], row['row'], FIELDS),
                 'planningArea': row['area'], 'sourceProjectName': values['Project Name'], 'rawStatus': values['Project Status'],
                 'rawExpectedInService': values['Expected In-Service Date'], 'lifecycle': lifecycle(values['Project Status'])}
        if reason:
            exclusions[reason] += 1
            entry.update(disposition='excluded', reason=reason)
        else:
            entry['recordKind'] = record_kind(row)
            entry['classificationBasis'] = 'accepted-explicit-transmission-scope-set' if record_kind(row) == 'transmission-project' else 'scope-not-promoted-under-conservative-qualification'
            if (row['page'], row['row']) in SAMPLE_SUMMARIES:
                project = make_project(row)
                projects.append(project)
                entry.update(disposition='imported', projectId=project['id'])
            else:
                entry.update(disposition='pending', reason='Accepted nonterminal row; normalization awaits sample connection.')
        ledger.append(entry)
    counts = {'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()), 'failedRows': 0,
              'pendingRows': sum(entry['disposition'] == 'pending' for entry in ledger), 'locatedRecords': 0}
    if counts != {'sourceRows': 152, 'importedRecords': 6, 'excludedRows': 16, 'failedRows': 0, 'pendingRows': 130, 'locatedRecords': 0}:
        raise ValueError('Accepted six-record sample reconciliation changed.')
    limitations = [
        'Historical 2025-10-30 edition, not current lifecycle. A September 2026 criteria deck references an August update whose complete inventory was not located.',
        'National Grid New York local plan only (NYISO Zones A–F); this does not cover every New York utility or planned project.',
        'Page/body-row source locators are not engineering IDs. Continuity into a later edition requires explicit identity review; no title/ordinal merge is assumed.',
        'The accepted full scope has eight explicitly described transmission records and 128 planning-context records; context is not a claim that work is non-transmission.',
        'No row-owner field establishes singular ownership. Publisher/utility context does not become an inferred owner identity.',
        'All records are unlocated; no native coordinates, map digitization, geocoding or planning-area centers are supplied.',
        'Expected in-service dates have month precision and do not establish construction windows or completion; study/permit progress does not override project status.',
        'Source facts are used for authorized private informational analysis. National Grid terms restrict other reproduction/distribution and commercial use; no open/commercial license or PDF publication is asserted.',
        'Six retained records are connected first; 130 accepted nonterminal rows remain pending before full-scope normalization.',
    ]
    manifest = {
        'sourceKey': KEY, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': KEY, 'reportingGroupName': GROUP,
        'publisher': 'National Grid', 'processAuthority': 'National Grid New York local transmission planning',
        'publishedOn': None, 'retrievedOn': '2026-09-30', 'source': source(), 'sha256': SHA,
        'geographicScope': 'National Grid New York local-plan footprint in NYISO Zones A–F; partial New York coverage, with no per-record state or center inferred.',
        'inventoryScope': 'Historical utility project-table entries, including explicitly described transmission work and unresolved/mixed planning context. Explicit In-Service and Cancelled rows are excluded.',
        'scope': 'sample', 'counts': counts, 'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(exclusions.items())],
        'limitations': limitations,
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': LABEL + ' — six-record sample', 'generatedAt': args.generated_at,
               'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': sum(exclusions.values()), 'failed': 0,
                            'notes': ['All 152 project-table rows are reconciled; 130 accepted nonterminal records remain pending.', 'Historical source inventory only; all six records remain unlocated with unknown owner identity.']}}
    quality = {'sourceKey': KEY, 'editionId': EDITION, 'scope': 'sample',
               'fullSourceStatusCounts': dict(sorted(Counter(row['values']['Project Status'] for row in rows).items())),
               'acceptedRetainedLifecycleCounts': {'planned': 90, 'under-construction': 15, 'unknown': 31},
               'acceptedRetainedKindCounts': {'transmission-project': 8, 'planning-context': 128},
               'importedLifecycleCounts': dict(sorted(Counter(project['inventory']['lifecycle'] for project in projects).items())),
               'importedKindCounts': dict(sorted(Counter(project['inventory']['recordKind'] for project in projects).items())),
               'fieldAnomalies': [{'source': source(31, 2, ['Project Status']), 'rawValue': 'Application Deemed Complete', 'handling': 'Preserved in its source field; lifecycle remains unknown.'}],
               'sampleIds': [project['id'] for project in projects]}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, value in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', ledger), ('source-quality.json', quality)]:
        (args.output_dir / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    sizes = {'scope': 'sample', 'datasetRecords': len(projects),
             'compactUtf8Bytes': len(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')).encode()),
             'formattedUtf8Bytes': (args.output_dir / 'dataset.json').stat().st_size}
    (args.output_dir / 'payload-sizes.json').write_text(json.dumps(sizes, indent=2) + '\n')
    print(json.dumps({'counts': counts, 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
