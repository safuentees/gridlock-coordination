#!/usr/bin/env python3
"""Normalize the accepted Nevada approved entries and construction-request source units."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

from pypdf import PdfReader

SOURCE = 'nv-nvenergy'
EDITION = '2026-05-06-irp'
AS_OF = '2026-05-06'
GROUP = 'NV Energy public transmission planning'
LABEL = 'NV Energy 2026 Joint IRP — approved entries and construction requests'
BASE_URL = 'https://www.nvenergy.com/publish/content/dam/nvenergy/brochures_arch/about-nvenergy/rates-regulatory/recent-regulatory-filings/2026-irp/'
FILES = {
    2: ('NPC-SPPC-Volume-2.pdf', '26b785915f24ba21bc488ad7096ebf0192ef05dfc16360ca4fb07b66b2e48cda'),
    8: ('NPC-SPPC-Volume-8.pdf', '6b915a71d43e3588596f731ce0149b7bb1a4d952f1976c0f7003d0f887847433'),
    9: ('NPC-SPPC-Volume-9.pdf', '674f4a973742a716f721cb36c67c3e9dd84caa969250a907cd3ba144c7f1b72f'),
}
POLICY = json.loads(Path(__file__).with_name('policy.json').read_text())
REQUEST_POLICY = json.loads(Path(__file__).with_name('request-policy.json').read_text())
REQUESTS = {row['requestNumber']: row for row in REQUEST_POLICY['rows']}
RELATIONSHIPS = {row['id']: row for row in REQUEST_POLICY['relationships']}
SAMPLE = set(POLICY['sampleApprovedRows'])
CONTEXT = set(POLICY['approvedCapitalContextRows'])


def clean(value):
    return re.sub(r'\s+', ' ', value).strip()


def ref(volume, locator):
    name, _ = FILES[volume]
    return {'file': name, 'locator': locator, 'url': BASE_URL + name}


def approved_id(number):
    return f'2026-05-06:tp-131:row-{number:02d}'


def request_id(number):
    return f'2026-05-06:exhibit-b:request-{number:02d}'


def approved_locator(number):
    page = 54 if number <= 12 else 55
    return f'Figure TP-131; row {number} across both pages; PDF p.{page} / printed p.{page + 239}'


def load_sources(input_dir):
    readers, source_files = {}, []
    for volume, (name, expected_hash) in FILES.items():
        path = input_dir / name
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if actual_hash != expected_hash:
            raise ValueError(f'{name} differs from the accepted public edition; qualify the changed source before generating.')
        readers[volume] = PdfReader(path)
        source_files.append({'volume': volume, 'file': name, 'url': BASE_URL + name,
                             'sha256': actual_hash, 'bytes': path.stat().st_size})
    return readers, source_files


def approved_rows(reader):
    rows = []
    for page, expected_count in [(54, 12), (55, 9)]:
        text = reader.pages[page - 1].extract_text()
        if page == 54:
            text = text.split('APPROVED PROJECTS UDPATE TABLE', 1)[1]
        else:
            text = text.split('GREENLINK NEVADA TRANSMISSION', 1)[0]
        # Dockets begin every table row and are not used as project identities.
        starts = list(re.finditer(r'\b\d{2}-\d{5}\b', text))
        if len(starts) != expected_count:
            raise ValueError(f'Unexpected approved-table row count on PDF {page}.')
        for offset, start in enumerate(starts):
            end = starts[offset + 1].start() if offset + 1 < len(starts) else len(text)
            raw = clean(text[start.start():end])
            # The first page's printed footer follows its final numeric cost.
            if page == 54 and offset == len(starts) - 1:
                raw = re.sub(r'\s+293$', '', raw)
            match = re.fullmatch(r'(\d{2}-\d{5})\s+(.+?)\s+(\d{1,2}/\d{1,2}/\d{4}|NA|See narrative)\s+(Active|Suspended)\s+(.+)', raw)
            if not match:
                raise ValueError(f'Unresolved approved-table row on PDF {page}: {raw}')
            number = len(rows) + 1
            rows.append({'rowNumber': number, 'pdfPage': page, 'printedPage': page + 239,
                         'Docket': match[1], 'Project Name': match[2], 'ISD': match[3],
                         'Status': match[4], 'Cost ($MM) - as of February 2026': match[5]})
    return rows


def request_rows(reader):
    rows = []
    for page, expected_count in [(46, 4), (47, 17), (48, 18), (49, 17), (50, 13)]:
        text = reader.pages[page - 1].extract_text()
        if page == 46:
            text = text.split('TRANSMISSION — IRP', 1)[1]
        if page == 50:
            text = text.split('DEMAND SIDE PROGRAMS', 1)[0]
        bullets = text.split('•')[1:]
        if len(bullets) != expected_count:
            raise ValueError(f'Unexpected construction-request bullet count on PDF {page}.')
        for page_ordinal, bullet in enumerate(bullets, 1):
            # The last bullet can be followed by an isolated printed page number.
            lines = [line for line in bullet.splitlines() if not re.fullmatch(r'\s*\d+\s*', line)]
            rows.append({'requestNumber': len(rows) + 1, 'pdfPage': page, 'exhibitPage': page - 42,
                         'pageBullet': page_ordinal, 'requestText': clean(' '.join(lines))})
    return rows


def date(value, label='ISD (source forecast)'):
    if value in {'NA', 'See narrative'}:
        return {'value': None, 'precision': 'unknown', 'kind': 'in-service', 'label': label}
    month, day, year = value.split('/')
    return {'value': f'{year}-{int(month):02d}-{int(day):02d}', 'precision': 'day', 'kind': 'in-service', 'label': label}


def kind(number):
    return 'capital-project-context' if number in CONTEXT else 'transmission-project'


def lifecycle(number):
    return 'on-hold' if number in {8, 14} else 'under-construction' if number == 21 else 'approved'


def voltage_values(name):
    values = []
    for group in re.findall(r'(\d+(?:/\d+)*)\s*-?\s*kV\b', name, flags=re.I):
        for value in group.split('/'):
            if int(value) not in values:
                values.append(int(value))
    return values


def approved_project(row):
    number = row['rowNumber']
    citation = ref(9, approved_locator(number))
    sources = [citation]
    comparison_date = date(row['ISD'])
    milestones = [{'field': 'ISD (approved table)', 'date': comparison_date, 'evidence': [citation]}]
    notes = ['Approval docket: ' + row['Docket'] + '. This groups approvals and is not a native engineering project ID.',
             'Reported cost ($MM), as of February 2026: ' + row['Cost ($MM) - as of February 2026'] + '.',
             'May 6, 2026 is the application/source-edition date, not an individual status-change date. Active does not establish construction.',
             POLICY['approvedRowMeaning'][str(number)]]
    voltage = voltage_values(row['Project Name'])
    if number == 20:
        narrative = ref(9, 'Greenlink North narrative; PDF pp.55–56 / printed pp.294–295')
        sources.append(narrative)
        comparison_date = date('12/31/2028', 'Greenlink North planned in-service date')
        milestones.append({'field': 'Greenlink North planned in-service', 'date': comparison_date, 'evidence': [narrative]})
        notes.append('Construction was planned to start in January 2027. This month forecast does not supply an exact construction-start day or a verified construction window.')
        voltage = [525]
    elif number == 21:
        construction = ref(9, 'Greenlink West status and main in-service forecast; PDF p.58 / printed p.297')
        segment = ref(9, 'Greenlink West segment 4 and Common Ties narrative; PDF p.59 / printed p.298')
        grouping = ref(9, 'Greenlink North/West/Common Ties scope; PDF pp.55–56 / printed pp.294–295')
        sources.extend([construction, segment, grouping])
        milestones.extend([
            {'field': 'Greenlink West main in-service forecast', 'date': date('12/31/2027', 'Greenlink West main in-service forecast'), 'evidence': [construction]},
            {'field': 'Greenlink West segment 4 planned in-service', 'date': date('12/31/2028', 'Greenlink West segment 4 planned in-service'), 'evidence': [segment]},
        ])
        notes.append('Segment 1 construction began January 2025; this supports partial construction only. Main work forecasts December 31, 2027 and segment 4 December 31, 2028, so the compound project has no single comparison date.')
        voltage = [525]
    if number in {8, 14}:
        notes.append('Suspended remains on-hold; it is not cancelled or complete.')
    return {'id': SOURCE + ':' + approved_id(number), 'utilityId': SOURCE, 'sourceId': approved_id(number),
        'sponsor': 'Nevada Power Company and Sierra Pacific Power Company (joint applicants)',
        'name': row['Project Name'],
        'description': row['Project Name'] + '. Previously approved table entry; reported ' + row['Status'] + '. ' + POLICY['approvedRowMeaning'][str(number)],
        'status': row['Status'], 'voltageKv': voltage, 'date': comparison_date,
        'buildWindow': None, 'location': None, 'sources': sources, 'notes': notes,
        'inventory': {'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': kind(number), 'recordUnit': 'project', 'identityBasis': 'source-locator',
            'lifecycle': lifecycle(number), 'lifecycleAsOf': AS_OF, 'lifecycleDateMeaning': 'source-edition',
            'owner': None, 'parentProgramId': None, 'aliases': [],
            'workType': 'Previously approved transmission-associated work package',
            'sourceState': None, 'sourceLocation': None, 'sourceUpdatedOn': None, 'milestones': milestones,
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['No native coordinates or geometry are supplied by these table rows. Named facilities and routes do not establish a center, coordinate reference system or precision.']}}


def requested_project(row):
    number = row['requestNumber']
    decision = REQUESTS[number]
    if row['requestText'] != decision['rawRequest']:
        raise ValueError(f'Request {number} differs from the accepted row policy.')
    sources = list(decision['evidence'])
    notes = [
        'Construction approval is requested; the application does not establish approval or current construction.',
        decision['classificationReason'],
        'The in-service forecast preserves the request bullet year. No exact construction date or interval is supplied.',
        *decision['notes'],
    ]
    for group_id in decision['relatedGroupIds']:
        relation = RELATIONSHIPS[group_id]
        related_ids = [uid for uid in relation['requestSourceIds'] + relation['approvedSourceIds'] if uid != decision['sourceId']]
        notes.append('Related source actions: ' + relation['meaning'] + '. Source references: ' + ', '.join(related_ids) + '.')
        for evidence in relation['evidence']:
            if evidence not in sources:
                sources.append(evidence)
    milestones = [{'field': 'Exhibit B requested action in-service forecast',
        'date': decision['proposedDate'], 'evidence': [decision['source']]}, *decision['supplementaryMilestones']]
    return {'id': decision['proposedId'], 'utilityId': SOURCE, 'sourceId': decision['sourceId'],
        'sponsor': 'Nevada Power Company and Sierra Pacific Power Company (joint applicants)',
        'name': decision['proposedName'], 'description': row['requestText'],
        'status': 'Construction approval requested', 'voltageKv': decision['proposedVoltageKv'],
        'date': decision['proposedDate'], 'buildWindow': None, 'location': None,
        'sources': sources, 'notes': notes,
        'inventory': {'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
            'recordKind': decision['proposedRecordKind'], 'recordUnit': 'project', 'identityBasis': 'source-locator',
            'lifecycle': 'planned', 'lifecycleAsOf': AS_OF, 'lifecycleDateMeaning': 'source-edition',
            'owner': None, 'parentProgramId': None, 'aliases': [],
            'workType': 'Construction-approval request action',
            'sourceState': None, 'sourceLocation': None, 'sourceUpdatedOn': None, 'milestones': milestones,
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['The request supplies named facilities and source context but no native coordinates, geometry, coordinate reference system or precision. No location or owner is inferred.']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--stage', choices=('sample', 'approved', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    scope = 'full' if args.stage == 'full' else 'sample'
    if args.stage == 'full' and not REQUEST_POLICY['status'].startswith('accepted'):
        raise ValueError('Coordinator must accept the request policy before full generation.')
    readers, source_files = load_sources(args.input_dir)
    approved = approved_rows(readers[9])
    requests = request_rows(readers[2])
    projects, ledger = [], []
    for row in approved:
        number = row['rowNumber']
        entry = {'sourceId': approved_id(number), 'sourceUnit': 'approved-table-row',
                 'source': ref(9, approved_locator(number)), 'raw': row, 'recordKind': kind(number), 'lifecycle': lifecycle(number)}
        if args.stage in {'approved', 'full'} or number in SAMPLE:
            record = approved_project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'], reason='Accepted approved-table work unit retained.')
        else:
            entry.update(disposition='pending', reason='Approved entry retained by accepted policy, awaiting provider connection before the 21-row slice.')
        ledger.append(entry)
    for row in requests:
        number = row['requestNumber']
        citation = ref(2, f'Application Exhibit B, TRANSMISSION — IRP, request {number}; PDF p.{row["pdfPage"]} / Exhibit B p.{row["exhibitPage"]}; page bullet {row["pageBullet"]}')
        decision = REQUESTS[number]
        entry = {'sourceId': request_id(number), 'sourceUnit': 'construction-approval-request',
            'source': citation, 'raw': row, 'recordKind': decision['proposedRecordKind'], 'lifecycle': 'planned',
            'relatedGroupIds': decision['relatedGroupIds'], 'rawRequestVoltageKv': decision['rawRequestVoltageKv'],
            'normalizedVoltageKv': decision['proposedVoltageKv'], 'voltagePolicy': decision['voltagePolicy']}
        if args.stage == 'full':
            record = requested_project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'],
                         reason='Accepted source action retained; distinct engineering-project identity is not asserted.')
        else:
            entry.update(disposition='pending', reason='Accepted request outside this partial producer stage; required for full selected-source completion.')
        ledger.append(entry)
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': 0,
              'failedRows': 0, 'pendingRows': len(ledger) - len(projects), 'locatedRecords': 0}
    manifest = {'sourceKey': SOURCE, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': SOURCE,
        'reportingGroupName': GROUP, 'publisher': 'Nevada Power Company and Sierra Pacific Power Company d/b/a NV Energy',
        'processAuthority': 'Public Utilities Commission of Nevada', 'publishedOn': None, 'retrievedOn': '2026-09-30',
        'source': ref(9, 'Figure TP-131, PDF pp.54–55 / printed pp.293–294; selected source also includes Volume2 ExhibitB TRANSMISSION — IRP, PDF pp.46–50'),
        'sha256': FILES[9][1],
        'geographicScope': 'Partial NV Energy public Nevada planning inventory, with cross-state named work such as Bordertown to California; not all Nevada utilities.',
        'inventoryScope': '21 approved-table rows plus 69 new construction-approval request bullets: 90 source work units, not unique engineering projects. No narrative parents/components or economic-benefit totals are additional records.',
        'scope': scope, 'counts': counts, 'exclusions': [],
        'limitations': [
            ('All 90 declared source units are reconciled: 21 approved entries and 69 requested actions. Complete refers only to these two source enumerations, not all Nevada projects or unique engineering assets.' if scope == 'full' else f'{len(projects)} approved entries are included; {21 - len(projects)} approved entries and all sixty-nine construction requests remain pending. The first 21-row table does not complete this source.'),
            'May 6, 2026 dates the joint application/source edition. Exact publication is not independently established; retrieval is not status recency.',
            'Raw Active means approved in this table; Suspended means on-hold. Greenlink West has partial-construction narrative evidence, not proof every component is under construction.',
            'Approved-table rows3/4/5/6/13/19 remain conservative capital context because their physical transmission scope is ambiguous or mixed. Row17 approval covers siting/permitting, not construction.',
            'All qualified owners and native locations/geometry are unknown. Joint applicants, approval dockets, named facilities and routes cannot substitute for those fields.',
            'Exact ISD days remain forecasts; Greenlink West has distinct main/segment4 milestones and an unknown aggregate comparison date. No construction interval is inferred.',
            'One source row may be a compound program. Common Ties belongs within Greenlink West. Narrative components and economic-benefit totals are not extra records.',
            'Accepted request policy retains all69 observations:52 transmission and17 HVD/distribution/mixed capital context, all planned with year forecasts. Six conflicting voltages stay unknown; cited raw values and eleven relationship groups preserve unresolved identities. No duplicate exclusion or parent identity is inferred.',
            'Public redacted source facts only; no confidential appendix, contact metadata, redaction recovery or source-binary redistribution. Source filenames/hashes for all three volumes are preserved in the ledger.',
        ]}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': LABEL + (' — full selected inventory' if scope == 'full' else ' — approved slice; requests pending' if args.stage == 'approved' else ' — connection sample'),
        'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
        'coverage': {'processed': len(projects), 'skipped': 0, 'failed': 0,
            'notes': [f'90 source units = {len(projects)} imported + {counts["pendingRows"]} pending; zero excluded source units.',
                      'Every approved entry and request retains its original source reference. Retention represents source observations, not deduplicated engineering assets.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': EDITION, 'scope': scope, 'counts': counts,
        'sourceFiles': source_files, 'sourceUnitCounts': {'approved-table-row': len(approved), 'construction-approval-request': len(requests)},
        'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
        'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
        'requestPolicyStatus': REQUEST_POLICY['status'], 'relationships': REQUEST_POLICY['relationships'], 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': EDITION, 'scope': scope, 'stage': args.stage, 'records': len(projects),
        'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
        'measurement': 'Source-only Dataset2 UTF-8 JSON; aggregate/export envelope can be larger.', 'datasetFileFormat': 'compact' if scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if scope == 'full' else formatted)
    for name, content in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / name).write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'counts': counts, 'recordKindCounts': row_ledger['recordKindCounts'], 'lifecycleCounts': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
