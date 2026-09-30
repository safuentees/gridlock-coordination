#!/usr/bin/env python3
"""Produce the accepted C2 PJM snapshot from a preserved, public XML export."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

SOURCE = 'pjm-rtep'
EDITION = 'snapshot-2026-09-30-1cc0ae1b7825'
OBSERVED = '2026-09-30'
LABEL = 'PJM public RTEP — snapshot September 30, 2026'
GROUP_NAME = 'PJM RTEP inventory'
FILE = 'projectCostUpgrades.xml'
URL = 'https://www.pjm.com/pjmfiles/media/planning/projectConstruction-data/projectCostUpgrades.xml'
SHA = '1cc0ae1b78258cbe81108ec2fdd43754098a57cc5ec224f6e7300cafefe2eb31'
SAMPLE = {'s0275', 'n0613', 'b1570.3', 'b2970', 'b3869.3', 'n8733.0'}
LIFECYCLES = {'EP': 'planned', 'PL': 'planned', 'Active': 'planned', 'UC': 'under-construction', 'UC-ISP': 'under-construction', 'On Hold': 'on-hold'}
EXCLUSIONS = {'IS': 'IS — in service', 'Cancelled': 'Cancelled — cancelled', 'W': 'W — withdrawn'}
DATE_FIELDS = {
    'RequiredDate': ('need', 'Source required date (criteria violation)'),
    'ProjectedInServiceDate': ('in-service', 'Source projected in-service date'),
    'ActualInServiceDate': ('in-service', 'Source actual in-service date'),
    'ISAInServiceDate': ('in-service', 'Source ISA in-service date'),
    'RevisedInServiceDate': ('in-service', 'Source revised in-service date'),
    'PJMBoardApprovalDate': ('unknown', 'Source PJM board-approval date'),
    'InitialTEACDate': ('unknown', 'Source initial TEAC date'),
    'LatestTEACDate': ('unknown', 'Source latest TEAC date'),
    'TEACDates': ('unknown', 'Source TEAC meeting date'),
}


def evidence(native_id, field=None):
    locator = f"/Upgrades/Upgrade[UpgradeId='{native_id}']"
    if field:
        locator += '/' + field
    return {'file': FILE, 'locator': locator, 'url': URL}


def parsed_date(raw, kind, label):
    value, precision = None, 'unknown'
    raw = raw.strip()
    if re.fullmatch(r'\d{4}', raw):
        value, precision = raw, 'year'
    elif re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', raw):
        value, precision = raw, 'month'
    else:
        for fmt in ('%m/%d/%Y', '%Y-%m-%d', '%m/%d/%y'):
            try:
                value, precision = datetime.strptime(raw, fmt).date().isoformat(), 'day'
                break
            except ValueError:
                pass
    return {'value': value, 'precision': precision, 'kind': kind, 'label': label}


def owner(raw, native_id):
    if not raw or raw == 'MISO' or re.search(r'[|/;&]', raw):
        return None
    token = 'DL' if raw in ('DL', 'Duquesne Light (DL)') else raw
    slug = re.sub(r'[^a-z0-9]+', '-', token.lower()).strip('-')
    if not slug:
        return None
    return {'id': 'pjm-to-' + slug, 'name': 'Duquesne Light (DL)' if token == 'DL' else raw,
            'identityScope': 'source', 'evidence': [evidence(native_id, 'TransmissionOwner')]}


def voltages(raw):
    if re.fullmatch(r'[0-9.\s/|,;\-]+', raw):
        values = re.findall(r'\d+(?:\.\d+)?', raw)
    else:
        values = re.findall(r'(\d+(?:\.\d+)?)\s*kV\b', raw, re.I)
    return sorted({float(v) for v in values if float(v) > 0})


def project(row):
    native_id, status = row['UpgradeId'], row['Status']
    notes, milestones = [], []
    for field, (kind, label) in DATE_FIELDS.items():
        raw = row.get(field, '')
        if not raw:
            continue
        # The TEAC list is preserved as individually cited dates; no chronology inferred.
        values = [v.strip() for v in re.split(r'[,;|]', raw)] if field == 'TEACDates' else [raw]
        for index, value in enumerate(values):
            if not value:
                continue
            parsed = parsed_date(value, kind, label)
            milestones.append({'field': f'{field}[{index + 1}]' if len(values) > 1 else field,
                               'date': parsed, 'evidence': [evidence(native_id, field)]})
            if parsed['value'] is None:
                notes.append(f'Unresolved source {field}: {value}')
    projected = parsed_date(row.get('ProjectedInServiceDate', ''), *DATE_FIELDS['ProjectedInServiceDate'])
    required = parsed_date(row.get('RequiredDate', ''), *DATE_FIELDS['RequiredDate'])
    comparison = projected if projected['value'] else required if required['value'] else {'value': None, 'precision': 'unknown', 'kind': 'unknown', 'label': 'No usable projected or required date'}
    updated = parsed_date(row.get('LastUpdated', ''), 'unknown', 'Source row last updated')
    if row.get('LastUpdated') and updated['precision'] != 'day':
        notes.append('Unresolved source LastUpdated: ' + row['LastUpdated'])
    if status == 'Active':
        notes.append('Active denotes a network upgrade linked to a queue project with a system impact study but no ISA/ICSA; it does not establish committed construction.')
    if status == 'UC-ISP':
        notes.append('The upgrade is partially in service with remaining construction; the entire upgrade is not classified as complete.')
    if native_id == 'n0613':
        notes.append('Source Voltage is 138 while Description mentions 345kV. Both source values are preserved; the discrepancy is unresolved.')
    if row.get('Task'):
        notes.append('Source task: ' + row['Task'])
    if row.get('SubRegion'):
        notes.append('Source subregion: ' + row['SubRegion'])
    if status not in LIFECYCLES:
        notes.append('Unrecognized source lifecycle remains unknown: ' + status)
    listed_owner = row.get('TransmissionOwner', '')
    qualified_owner = owner(listed_owner, native_id)
    if listed_owner and qualified_owner is None:
        notes.append('The listed transmission-owner value does not establish a single asset owner: ' + listed_owner)
    native_type = row.get('ProjectType', '')
    equipment = row.get('Equipment', '')
    label = row.get('Location') or equipment or (native_type + ' upgrade').strip()
    aliases = ['proposal:' + value.strip() for value in re.split(r'[,;|]', row.get('ProposalIds', '')) if value.strip()]
    return {'id': f'{SOURCE}:{native_id}', 'utilityId': SOURCE, 'sponsor': listed_owner or None,
            'sourceId': native_id, 'name': f'{native_id} — {label}', 'description': row.get('Description', ''),
            'status': status or None, 'voltageKv': voltages(row.get('Voltage', '')), 'date': comparison,
            'buildWindow': None, 'location': None, 'sources': [evidence(native_id)], 'notes': notes,
            'inventory': {'sourceKey': SOURCE, 'editionId': EDITION, 'editionLabel': LABEL,
                'reportingGroupName': GROUP_NAME, 'recordKind': 'transmission-project',
                'lifecycle': LIFECYCLES.get(status, 'unknown'), 'lifecycleAsOf': OBSERVED,
                'owner': qualified_owner, 'recordUnit': 'upgrade', 'sourceState': row.get('State') or None,
                'sourceLocation': row.get('Location') or None, 'sourceUpdatedOn': updated['value'] if updated['precision'] == 'day' else None,
                'lifecycleDateMeaning': 'snapshot-observed', 'milestones': milestones,
                'parentProgramId': None, 'aliases': aliases,
                'workType': ' — '.join(v for v in (native_type, equipment) if v) or None,
                'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
                'locationAssumptions': ['The public upgrade export has no native coordinates. Named location/state text is not geometry and no center is inferred.']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != SHA:
        raise ValueError('Input differs from the accepted public snapshot; qualify the new snapshot before importing.')
    root = ET.parse(args.input).getroot()
    projects, ledger, seen = [], [], set()
    excluded = Counter()
    for index, element in enumerate(root.findall('Upgrade'), 1):
        row = {child.tag: (child.text or '').strip() for child in element}
        native_id = row.get('UpgradeId', '')
        if not native_id or native_id in seen:
            raise ValueError(f'Missing or repeated native UpgradeId at XML ordinal {index}')
        seen.add(native_id)
        entry = {'sourceOrdinal': index, 'nativeId': native_id, 'projectType': row.get('ProjectType'), 'rawStatus': row.get('Status')}
        if args.scope == 'sample' and native_id not in SAMPLE:
            entry.update(disposition='pending', reason='Outside the six-record connection sample.')
        elif row.get('Status') in EXCLUSIONS:
            reason = EXCLUSIONS[row['Status']]
            entry.update(disposition='excluded', reason=reason)
            excluded[reason] += 1
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', reason='Nonterminal source upgrade retained.', projectId=record['id'])
        ledger.append(entry)
    pending = sum(r['disposition'] == 'pending' for r in ledger)
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(excluded.values()), 'failedRows': 0, 'pendingRows': pending, 'locatedRecords': 0}
    manifest = {'sourceKey': SOURCE, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': SOURCE, 'reportingGroupName': GROUP_NAME,
        'publisher': 'PJM Interconnection', 'processAuthority': 'PJM Interconnection', 'publishedOn': None, 'retrievedOn': OBSERVED,
        'source': {'file': FILE, 'locator': '/Upgrades/Upgrade; complete public export', 'url': URL}, 'sha256': SHA,
        'geographicScope': 'Public PJM RTEP upgrade inventory across its regional planning footprint; not complete statewide coverage. Preserve raw state text without assigning anomalous or outside-footprint values to jurisdictions.',
        'inventoryScope': 'All public Baseline, Network and Supplemental UpgradeId rows except IS, Cancelled and W. Retained units are upgrades, not deduplicated engineering projects; on-hold and pre-agreement work remain visible.',
        'scope': args.scope, 'counts': counts, 'exclusions': [{'reason': reason, 'count': count} for reason, count in sorted(excluded.items())],
        'limitations': ['This is a checksum-pinned retrieval snapshot, not a publisher-issued dated edition; row LastUpdated is not a lifecycle-change date.',
            'All locations are absent. Named locations, states and transmission-owner tokens are not coordinate evidence.',
            'Owners have source-scoped identity only. Blank/MISO/composite values do not establish one owner; DL and Duquesne Light (DL) share the explicit source alias.',
            'Required, projected, actual, revised, ISA, board and TEAC milestones remain distinct. No construction interval is inferred.',
            'Raw state values may be blank, multistate or anomalous. They do not establish complete jurisdiction coverage.',
            'Public export requires no login; PJM reserves rights and access does not confer an open reuse license. Preserve source attribution.']}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': f'{LABEL} — {args.scope} inventory', 'generatedAt': args.generated_at,
        'projects': projects, 'sourceEditions': [manifest], 'coverage': {'processed': len(projects), 'skipped': sum(excluded.values()), 'failed': 0,
            'notes': [f'{len(ledger)} public upgrade rows, {pending} pending in this {args.scope} slice.', 'No source coordinates; all upgrades remain unlocated.']}}
    ledger_output = {'sourceKey': SOURCE, 'editionId': EDITION, 'sourceSha256': SHA, 'scope': args.scope, 'counts': counts, 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False)+'\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False)+'\n'
    sizes = {'sourceKey': SOURCE, 'editionId': EDITION, 'scope': args.scope, 'records': len(projects),
        'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
        'measurement': 'UTF-8 JSON serialization of source-only Dataset2; actual aggregate/export envelope may be larger.', 'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir/'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for name, content in [('manifest.json', manifest), ('row-ledger.json', ledger_output), ('payload-sizes.json', sizes)]:
        (args.output_dir/name).write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False)+'\n')
    print(json.dumps({'counts': counts, 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
