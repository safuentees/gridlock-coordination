#!/usr/bin/env python3
"""Normalize the accepted public WAPA factual catalog against its checksum-pinned original."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name('catalog.json').read_text())
SOURCE = CATALOG['sourceKey']
RECOVERY = SOURCE == 'vi-wapa-recovery'
SAMPLE = set(CATALOG['sampleSourceRows'])


def milestone(value, precision, label):
    return {'value': value, 'precision': precision, 'kind': 'unknown', 'label': label}


def source_date(value, label):
    # Only valid, explicitly supplied project/procurement starts use this conversion.
    month, day, year = value.split('/')
    return milestone(f'{year}-{int(month):02d}-{int(day):02d}', 'day', label)


def project(row):
    raw, citation = row['raw'], row['source']
    milestones = [{'field': 'Target end' if RECOVERY else 'Individual completion/in-service date',
                   'date': row['proposedDate'], 'evidence': [citation]}]
    notes = [row['reason'], *row.get('notes', [])]
    if RECOVERY:
        notes.append(row['recencyCaveat'])
        if 'totalPoles' in raw:
            notes.append(f"Source installed poles: {raw['polesInstalled']} of {raw['totalPoles']}; reported status {raw['status']}; target end: {raw['targetEnd']}. These are August2023 source facts, not current completion.")
        elif 'projectStatus' in raw:
            notes.append('Source project status: ' + raw['projectStatus'] + '; target end: ' + raw['targetEndDate'] + '.')
        if 'projectStartDate' in raw:
            milestones.append({'field': 'Project Start Date (not established as construction start)',
                'date': source_date(raw['projectStartDate'], 'Source project start'), 'evidence': [citation]})
            notes.append('Project start is not established as physical construction start; no construction window is inferred.')
        if 'designEngineeringRfpStartDate' in raw:
            milestones.append({'field': 'Design & Engineering RFP start',
                'date': source_date(raw['designEngineeringRfpStartDate'], 'Design & Engineering RFP start'), 'evidence': [citation]})
        if raw.get('targetEndDate') == '11/31/2023':
            notes.append('The invalid source target 11/31/2023 remains raw evidence. Its normalized date is unknown.')
        if 'sourceHeading' in raw:
            notes.append('The source heading is ' + raw['sourceHeading'] + '; no actual status date is supplied for this page.')
        status = raw.get('status', raw.get('projectStatus', raw.get('sourceHeading')))
        description = row['name'] + ' — ' + row['reason']
    else:
        status = 'Scheduled remaining work; completion not confirmed'
        description = raw['scope'] + '. ' + row['reason']
        schedule_ref = {'file': CATALOG['sourceFile'], 'url': CATALOG['sourceUrl'],
                        'locator': 'Article introduction and shared scheduled outage nights July13/14,2026; not assigned to either individual project'}
        for value in ['2026-07-13', '2026-07-14']:
            milestones.append({'field': 'Shared scheduled outage night (not individual energization)',
                'date': milestone(value, 'day', 'Shared scheduled outage night'), 'evidence': [schedule_ref]})
    location_text = 'Affected area: ' + raw['areasAffected'] if 'areasAffected' in raw else 'Reported island: ' + raw['island'] if 'island' in raw else None
    return {'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': 'Virgin Islands Water and Power Authority (publisher/operator context)',
        'name': row['name'], 'description': description, 'status': status, 'voltageKv': [],
        'date': row['proposedDate'], 'buildWindow': None, 'location': None, 'sources': row['evidence'], 'notes': notes,
        'inventory': {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'editionLabel': CATALOG['label'],
            'reportingGroupName': CATALOG['reportingGroupName'], 'recordKind': row['proposedRecordKind'],
            'recordUnit': 'project', 'identityBasis': 'source-locator', 'lifecycle': row['proposedLifecycle'],
            'lifecycleAsOf': row['lifecycleAsOf'], 'lifecycleDateMeaning': row['lifecycleDateMeaning'],
            'owner': None, 'parentProgramId': None, 'aliases': [],
            'workType': 'Historical electrical mitigation package' if RECOVERY else 'Scheduled grid upgrade work',
            'sourceState': None, 'sourceLocation': location_text, 'sourceUpdatedOn': None,
            'milestones': milestones, 'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['Named islands, affected areas, feeder/circuit references and endpoints are source context, not native geometry or inferred project centers.']}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default=CATALOG['defaultScope'])
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != CATALOG['sourceSha256']:
        raise ValueError('Original differs from the accepted public source; qualify a changed edition before normalizing.')
    rows, projects, ledger = CATALOG['rows'], [], []
    for row in rows:
        entry = {'sourceId': row['sourceId'], 'sourceRow': row['sourceRow'], 'source': row['source'],
                 'name': row['name'], 'raw': row['raw'], 'recordKind': row['proposedRecordKind'],
                 'lifecycle': row['proposedLifecycle'], 'lifecycleAsOf': row['lifecycleAsOf'],
                 'lifecycleDateMeaning': row['lifecycleDateMeaning']}
        if row['proposedDisposition'] == 'exclude':
            entry.update(disposition='excluded', reason=row['reason'])
        elif args.scope == 'sample' and row['sourceRow'] not in SAMPLE:
            entry.update(disposition='pending', reason='Accepted retained package outside the initial connection sample.')
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'], reason=row['reason'])
        ledger.append(entry)
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    counts = {'sourceRows': len(rows), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    limitations = [
        'These source observations are not a current complete Virgin Islands project register or a count of unique engineering assets.',
        'WAPA is publisher/operator context; no per-package sole owner evidence is established. Contractors and funding agencies are not owners.',
        'All normalized voltages, coordinates/native geometry, construction-start days and construction intervals remain unknown. Undergrounding alone is not a transmission role.',
        'Feeder/circuit labels are asset references, not engineering project IDs. Source-locator identity preserves named packages and island distinctions; compound work is not split.',
        'No keyed crosswalk proves equivalence between historical recovery entries and newer upgrades. Related names are not merged, and affected feeder lists are not projects.',
    ]
    if RECOVERY:
        limitations += [
            'The linked historical PDF filename suggests2023 but does not verify publication. Only page6 explicitly dates facts to August2023; pages7–8 use September30,2026 snapshot-observed meaning, never a2026 status update.',
            'Historical target ends are project-completion forecasts, not in-service dates or evidence of completion today. Invalid11/31/2023 stays unknown with raw evidence.',
            'Project-status percentages on page7 do not establish physical construction stage. Design-RFP and project starts are not construction starts.',
            'Four completed underground packages and the completed Water Island pole package are excluded. Generation/storage, water, systems and training elsewhere in the deck are outside the selected pages6–8.',
        ]
    else:
        limitations += [
            'July7,2026 is the dated release/source edition, not a confirmation that work was completed later.',
            'The July13/14 outage schedule applies to both named works without assigning a per-project energization/completion day. Shared outage nights remain evidence, not construction windows.',
        ]
    manifest = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'label': CATALOG['label'],
        'reportingGroupId': SOURCE, 'reportingGroupName': CATALOG['reportingGroupName'], 'publisher': CATALOG['publisher'],
        'processAuthority': None, 'publishedOn': CATALOG['publishedOn'], 'retrievedOn': CATALOG['retrievedOn'],
        'source': {'file': CATALOG['sourceFile'], 'locator': CATALOG['sourceLocator'], 'url': CATALOG['sourceUrl']},
        'sha256': CATALOG['sourceSha256'],
        'geographicScope': 'Partial multi-island WAPA recovery observations: St.Thomas, St.John, St.Croix and completed Water Island work.' if RECOVERY else 'Two works serving eastern St.Thomas and St.John; affected areas are not site geometry.',
        'inventoryScope': 'All24 named packages in PDF pages6–8: four island pole packages, three substations and17 underground entries; five explicitly completed packages excluded.' if RECOVERY else 'Both named remaining-work descriptions in the July7,2026 release; outage-affected feeders and old assets are not additional projects.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()], 'limitations': limitations}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': CATALOG['label'] + ' — ' + args.scope,
        'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
            'notes': [f"{len(rows)} source units = {len(projects)} imported + {counts['excludedRows']} excluded + {counts['pendingRows']} pending.",
                      'Public factual catalog normalized against its checksum-pinned unchanged original; no native geography/ownership or current status inferred.']}}
    retained = [row for row in rows if row['proposedDisposition'] == 'retain']
    row_ledger = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope,
        'sourceSha256': CATALOG['sourceSha256'], 'counts': counts,
        'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
        'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
        'completeRetainedRecordKindCounts': dict(Counter(row['proposedRecordKind'] for row in retained)),
        'completeRetainedLifecycleCounts': dict(Counter(row['proposedLifecycle'] for row in retained)), 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope, 'records': len(projects),
        'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
        'measurement': 'Source-only Dataset2 UTF-8 JSON including final newline; aggregate/export envelope can be larger.',
        'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for filename, content in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / filename).write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'sourceKey': SOURCE, 'counts': counts, 'recordKindCounts': row_ledger['recordKindCounts'], 'lifecycleCounts': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
