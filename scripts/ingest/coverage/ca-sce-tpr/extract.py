#!/usr/bin/env python3
"""Read the preserved public SCE TPR edition and emit its C1 source snapshot."""
import argparse
from collections import Counter
from datetime import date, datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re

import openpyxl

SOURCE_KEY = 'ca-sce-tpr'
EDITION = '2026-06-01'
EDITION_LABEL = 'SCE public TPR — June 1, 2026'
GROUP = 'sce-tpr'
GROUP_NAME = 'SCE TPR filing'
FILE = '01 Public_(Public)SCE TPR Process-June 2026.xlsx'
URL = 'https://www.sce.com/sites/default/files/Regulatory/OpenAccessInformation/TPR/01%20Public_%28Public%29SCE%20TPR%20Process-June%202026.xlsx'
SHA256 = '42f5ce7a686d08f3900d02eb5ebd09fe089dba39f6e04b1279038d6fde473118'
SHEET = 'CPUC TPR Public'
SAMPLE_IDS = {'SP-01', 'PB-02.01', 'SP-05', 'PB-32.03', 'PB-04.01', 'SP-118'}
EMPTY = {'', 'na', 'n/a', 'none', 'tbd', 'multiple'}


def text(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    return str(value).strip()


def present(value):
    return text(value) is not None and text(value).lower() not in EMPTY


def ref(locator):
    return {'file': FILE, 'locator': locator, 'url': URL}


def parse_date(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()[:10], 'day'
    value = text(value)
    if not present(value):
        return None, 'unknown'
    if re.fullmatch(r'\d{4}', value):
        return value, 'year'
    if re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', value):
        return value, 'month'
    for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.strptime(value, fmt).date().isoformat(), 'day'
        except ValueError:
            pass
    return None, 'unknown'


def lifecycle(raw):
    if raw == 'Planning' or str(raw).startswith('Engineering') or raw == 'Permitting':
        return 'planned'
    if str(raw).startswith('Construction'):
        return 'under-construction'
    return {'On Hold': 'on-hold', 'Operational': 'in-service', 'Canceled': 'cancelled'}.get(raw, 'unknown')


def voltage(line_field, capacity_field):
    values = set()
    line = text(line_field) or ''
    if re.fullmatch(r'[0-9.\s|/,;\-]+', line):
        values.update(float(v) for v in re.findall(r'\d+(?:\.\d+)?', line))
    for field in (line, text(capacity_field) or ''):
        for group in re.findall(r'((?:\d+(?:\.\d+)?\s*[/|]\s*)*\d+(?:\.\d+)?)\s*kV\b', field, re.I):
            values.update(float(v) for v in re.findall(r'\d+(?:\.\d+)?', group))
    return sorted(v for v in values if v > 0)


def geometry(row, number):
    latitude, longitude = text(row['C']), text(row['D'])
    evidence = [ref(f"'{SHEET}'!C{number}:D{number}"), ref("'TPR Notes'!B5:C5")]
    assumptions = []
    if not present(latitude) and not present(longitude):
        return None, None, 'unknown', ['The public source provides no usable latitude/longitude pair.'], None
    try:
        latitudes = [float(v.strip()) for v in (latitude or '').split('|')]
        longitudes = [float(v.strip()) for v in (longitude or '').split('|')]
        if len(latitudes) != len(longitudes) or not latitudes:
            raise ValueError('unequal coordinate counts')
        positions = list(zip(longitudes, latitudes))
        if any(not math.isfinite(lon) or not math.isfinite(lat) or not -180 <= lon <= 180 or not -90 <= lat <= 90 for lon, lat in positions):
            raise ValueError('coordinate outside geographic range')
    except ValueError:
        issue = 'Published coordinate fields could not be paired as finite geographic positions.'
        assumptions.append(issue + ' Raw fields are retained in the row ledger and cited source.')
        return None, None, 'unknown', assumptions, issue
    work_type = text(row['G']) or ''
    named_scope = f"{row['B']} {row['F']}"
    if len(positions) == 1 and work_type.startswith('Substation'):
        role = 'substation-center'
    elif len(positions) == 1 and work_type == 'Transmission Line - Pole/Tower' and re.search(r'\bM\d+\s*[-–]\s*T\d+\b|\b(?:one|single) tower\b|\btower location\b', named_scope, re.I):
        role = 'tower-location'
    elif len(positions) > 1 and work_type.startswith('Transmission Line'):
        role = 'line-endpoints'
    else:
        role = 'multiple-locations' if len(positions) > 1 else 'unknown'
    native = {'type': 'Point' if len(positions) == 1 else 'MultiPoint', 'coordinates': [list(p) for p in positions], 'role': role, 'crs': None, 'accuracyMeters': None, 'rawLatitude': latitude, 'rawLongitude': longitude, 'evidence': evidence}
    assumptions.append('Published latitude/longitude is interpreted as decimal WGS84 for map display only; the source does not state its datum or positional accuracy.')
    location, center_role = None, 'unknown'
    if len(positions) == 1 and role in ('substation-center', 'tower-location'):
        lon, lat = positions[0]
        location = {'lat': lat, 'lon': lon, 'method': 'source-point', 'confidence': 'unverified', 'evidence': evidence}
        center_role = role
    elif len(positions) == 2 and role == 'line-endpoints':
        # Source normalization only: the agreed endpoint arithmetic convention.
        lon, lat = [(positions[0][axis] + positions[1][axis]) / 2 for axis in (0, 1)]
        location = {'lat': lat, 'lon': lon, 'method': 'endpoint-midpoint', 'confidence': 'unverified', 'evidence': evidence}
        center_role = 'endpoint-midpoint'
        assumptions.append('The displayed center is the arithmetic midpoint of the two published endpoints, not a surveyed route center or the complete work footprint.')
    else:
        assumptions.append('No center is derived because the published point roles or multi-location collection do not establish a single qualified center.')
    return native, location, center_role, assumptions, None


def project(row, number):
    native_id = text(row['A'])
    status = text(row['BB'])
    notes = []
    reported_date, precision = parse_date(row['BF'])
    start, start_precision = parse_date(row['BD'])
    if present(row['BF']) and precision == 'unknown':
        notes.append('Unresolved reported projected or actual in-service value: ' + text(row['BF']))
    if present(row['BD']) and start_precision != 'day':
        notes.append('Construction start is not a complete day: ' + text(row['BD']))
    source_notes = (text(row['CM']) or '').lower()
    if 'operational' in source_notes and lifecycle(status) != 'in-service':
        notes.append('The source notes describe operational assets with remaining project work; the source row lifecycle is retained.')
    if 'construction start' in source_notes:
        notes.append('The source Notes column includes a construction-start clarification. No continuous construction interval is inferred.')
    if native_id in ('PB-02.01', 'PB-02.04'):
        notes.append('The reported start belongs to a multi-year replacement program performed during scheduled outages, not continuous construction.')
    if native_id == 'PB-04.01':
        notes.append('Transformer-sharing and spare-equipment context has no stated project lifecycle or schedule.')
    native, location, center_role, assumptions, issue = geometry(row, number)
    aliases = []
    for col, prefix in [('AD', 'work-order'), ('AE', 'accounting-id'), ('AF', 'program-account')]:
        for part in (text(row[col]) or '').split('|'):
            part = part.strip()
            if present(part) and not part.lower().startswith('multiple'):
                aliases.append(f'{prefix}:{part}')
    work_type = text(row['G']) if present(row['G']) else None
    kind = 'transmission-project' if work_type and work_type.startswith(('Substation', 'Transmission Line')) and native_id != 'PB-04.01' else 'capital-project-context'
    sources = [ref(f"'{SHEET}'!A{number}:CM{number}; headers row 3"), ref("'TPR Notes'!B3:C5, B23:C23")]
    result = {'id': f'{SOURCE_KEY}:{native_id}', 'utilityId': GROUP, 'sponsor': None, 'sourceId': native_id, 'name': text(row['B']), 'description': text(row['F']) or '', 'status': status, 'voltageKv': voltage(row['AA'], row['AB']), 'date': {'value': reported_date, 'precision': precision, 'kind': 'in-service', 'label': 'Reported projected or actual in-service date'}, 'buildWindow': None, 'location': location, 'sources': sources, 'notes': notes,
        'inventory': {'sourceKey': SOURCE_KEY, 'editionId': EDITION, 'editionLabel': EDITION_LABEL, 'reportingGroupName': GROUP_NAME, 'recordKind': kind, 'lifecycle': lifecycle(status), 'lifecycleAsOf': EDITION, 'owner': None, 'parentProgramId': native_id.split('.')[0] if native_id.startswith('PB-') and '.' in native_id else None, 'aliases': aliases, 'workType': work_type, 'constructionStart': start if start_precision == 'day' else None, 'nativeGeometry': native, 'centerRole': center_role, 'locationAssumptions': assumptions}}
    return result, issue


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    parser.add_argument('--retrieved-on', default='2026-09-30')
    args = parser.parse_args()
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != SHA256:
        raise ValueError('Input is not the qualified public June 2026 source edition; review a new edition separately.')
    workbook = openpyxl.load_workbook(args.input, read_only=True, data_only=True)
    sheet = workbook[SHEET]
    projects, ledger, seen = [], [], set()
    excluded = Counter()
    for cells in sheet.iter_rows(min_row=4, max_row=497, max_col=91):
        row = {cell.column_letter: cell.value for cell in cells}
        number = cells[0].row
        native_id = text(row['A'])
        if not native_id or not text(row['B']) or native_id in seen:
            raise ValueError(f'Unusable or repeated native identity in source row {number}')
        seen.add(native_id)
        aggregate = native_id.startswith('PB-') and '.' not in native_id
        record_class = 'program-aggregate' if aggregate else 'program-subproject' if native_id.startswith('PB-') else 'specific-project'
        entry = {'sourceRow': number, 'nativeId': native_id, 'locator': f"'{SHEET}'!A{number}:CM{number}", 'recordClass': record_class, 'rawLifecycle': text(row['BB']), 'rawLatitude': text(row['C']), 'rawLongitude': text(row['D']), 'nativeIdChanges': text(row['AG'])}
        if args.scope == 'sample' and native_id not in SAMPLE_IDS:
            entry.update(disposition='pending', reason='Outside the six-record connection sample; full source reconciliation follows.')
        elif aggregate or row['BB'] in ('Operational', 'Canceled'):
            reason = 'program-aggregate' if aggregate else 'operational' if row['BB'] == 'Operational' else 'cancelled'
            entry.update(disposition='excluded', reason=reason)
            excluded[reason] += 1
        else:
            record, issue = project(row, number)
            projects.append(record)
            entry.update(disposition='imported', reason='Retained nonterminal or unknown project line.', projectId=record['id'], geometryIssue=issue)
        ledger.append(entry)
    pending = sum(entry['disposition'] == 'pending' for entry in ledger)
    located = sum(p['location'] is not None for p in projects)
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(excluded.values()), 'failedRows': 0, 'pendingRows': pending, 'locatedRecords': located}
    manifest = {'sourceKey': SOURCE_KEY, 'editionId': EDITION, 'label': EDITION_LABEL, 'reportingGroupId': GROUP, 'reportingGroupName': GROUP_NAME, 'publisher': 'Southern California Edison', 'processAuthority': 'California Public Utilities Commission', 'publishedOn': EDITION, 'retrievedOn': args.retrieved_on, 'source': ref(f"'{SHEET}'!A4:CM497; headers row 3; 'TPR Notes'!B3:C5, B23:C23"), 'sha256': SHA256, 'geographicScope': 'SCE FERC-jurisdictional transmission capital portfolio, including reported work outside California; not all California transmission projects.', 'inventoryScope': 'Nonaggregate project/subproject lines except Operational and Canceled. On Hold and unknown lifecycle remain visible; includes ancillary capital work. Program aggregates are separately reconciled without inventing child projects.', 'scope': args.scope, 'counts': counts, 'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(excluded.items())], 'limitations': ['Source edition lifecycle is not live status and never inferred from elapsed milestone dates.', 'Project Manager is not asset owner; personal manager data is omitted and owners remain unknown.', 'Published positions have no stated datum or positional accuracy; mapped centers remain unverified with explicit assumptions.', 'Multiple or ambiguous positions may be retained without a center. No route geometry is inferred.', 'Construction start and projected-or-actual in-service are distinct; no construction end or continuous interval is inferred.', 'Public download is available without login; no dataset-specific open reuse license was declared.', 'Native TPR IDs are preserved; repeated work orders are aliases, not deduplication keys.']}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': f'{EDITION_LABEL} — {args.scope} inventory', 'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest], 'coverage': {'processed': len(projects), 'skipped': sum(excluded.values()), 'failed': 0, 'notes': [f'{len(ledger)} public source rows; {pending} pending in this {args.scope} snapshot.', 'Source-specific dataset only. Coordinator combines it with preserved legacy inventory.']}}
    receipt = {'sourceKey': SOURCE_KEY, 'editionId': EDITION, 'sourceSha256': SHA256, 'scope': args.scope, 'generatedAt': args.generated_at, 'counts': counts, 'rows': ledger}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, output in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', receipt)]:
        (args.output_dir/name).write_text(json.dumps(output, indent=2, ensure_ascii=False, allow_nan=False)+'\n')
    print(json.dumps({'scope': args.scope, 'counts': counts}))


if __name__ == '__main__':
    main()
