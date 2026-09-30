#!/usr/bin/env python3
"""Normalize the accepted Santee public-source catalog against hash-pinned originals."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name('catalog.json').read_text())
SOURCE = CATALOG['sourceKey']
ARTIFACTS = {item['file']: item for item in CATALOG['artifacts']}
SAMPLE = set(CATALOG['sampleSourceIds'])


def ref(file, locator):
    return {'file': file, 'locator': locator, 'url': ARTIFACTS[file]['url']}


def date(value, precision, kind, label):
    return {'value': value, 'precision': precision, 'kind': kind, 'label': label}


def milestone(field, value, precision, kind, label, evidence):
    return {'field': field, 'date': date(value, precision, kind, label), 'evidence': evidence}


def project(row):
    normalized = row['normalized']
    refs = [row['source'], *normalized['supplementarySources'], CATALOG['ownershipEvidence']['source']]
    notes = list(normalized['notes'])
    notes.append('Status was observed in a September 30, 2026 composite snapshot; the IRP has a November 21, 2025 filing stamp and the project webpages have no verified update date.')
    notes.append('Santee Cooper is the publisher/project proponent. The operated network includes Authority-owned and Central-owned equipment; ownership of this named package is not established.')
    milestones = []
    if row.get('rawCompletionYear'):
        milestones.append(milestone('IRP scheduled completion', row['rawCompletionYear'], 'year', 'unknown',
                                    'IRP scheduled completion year; not confirmation of service', [row['source']]))
    if row['sourceRow'] == 15:
        web = ref('hemingway-kingstree-2.html', 'Timeline, 2029: forecast service by June 1; administrative closeout by year-end')
        milestones.extend([
            {'field': 'Website forecast in-service target', 'date': normalized['date'], 'evidence': [web]},
            milestone('Website forecast administrative closeout', '2029', 'year', 'unknown',
                      'By the end of 2029 after accounting, engineering and lessons learned; not energization', [web]),
        ])
    elif row['sourceRow'] == 16:
        web = ref('bluffton-market-place.html', 'Project Description and Timeline: 2028 service forecast; Beaufort County versus IRP Jasper County')
        milestones.append(milestone('Website forecast in-service target, unresolved conflict', '2028-06-01', 'day', 'in-service',
                                    'Undated website target by June 1, 2028 conflicts with IRP 2030 completion', [web]))
    elif row['sourceRow'] == 29:
        web = ref('indian-field-sugar-hill.html', 'Timeline: approximate Spring 2026 construction start and Winter 2026 completion; schedule may change')
        milestones.extend([
            {'field': 'Website approximate completion, raw Winter 2026', 'date': normalized['date'], 'evidence': [web]},
            milestone('Website approximate construction start, raw Spring 2026', '2026', 'year', 'unknown',
                      'Spring 2026 forecast; no exact start day or construction interval', [web]),
        ])
    elif row['sourceRow'] == 31:
        web = ref('varnville-robertville.html', 'Project Description and Timeline: around March start, July construction end, December 23 administrative wrap-up')
        milestones.extend([
            milestone('Website approximate construction start', '2026-03', 'month', 'unknown',
                      'Around March 2026 forecast; not an observed construction start', [web]),
            {'field': 'Website projected construction end', 'date': normalized['date'], 'evidence': [web]},
            milestone('Website forecast administrative wrap-up', '2026-12-23', 'day', 'unknown',
                      'After accounting, engineering and lessons learned; not construction finish or service', [web]),
        ])
    for entry in normalized.get('milestones', []):
        milestones.append(entry)
    aliases = []
    for regulatory in CATALOG['regulatoryEvidence']:
        if regulatory['relatedSourceId'] != row['sourceId']:
            continue
        refs.append(regulatory['source'])
        aliases.append('SCPSC docket ' + regulatory['docket'])
        if regulatory.get('order'):
            aliases.append('SCPSC order ' + regulatory['order'])
        if regulatory.get('approvalDate'):
            milestones.append(milestone('Reported certificate approval', regulatory['approvalDate'], 'day', 'unknown',
                                        'Regulatory approval; not physical construction or energization', [regulatory['source']]))
        elif regulatory.get('hearingForecast'):
            milestones.append(milestone('Reported hearing forecast', regulatory['hearingForecast'], 'day', 'unknown',
                                        'Report says pending; an elapsed hearing forecast does not establish approval', [regulatory['source']]))
    for relation in CATALOG['unresolvedRelations']:
        if row['sourceId'] in relation['sourceIds']:
            notes.append(relation['meaning'])
    refs = list({(item['file'], item['locator'], item['url']): item for item in refs}.values())
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': 'Santee Cooper (publisher/project proponent)', 'name': row['title'],
        'description': normalized['description'], 'status': row.get('rawSection', 'Public project plan'),
        'voltageKv': normalized['voltageKv'], 'date': normalized['date'],
        'buildWindow': None, 'location': None, 'sources': refs, 'notes': notes,
        'inventory': {
            'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'editionLabel': CATALOG['label'],
            'reportingGroupName': CATALOG['reportingGroupName'], 'recordKind': 'transmission-project',
            'lifecycle': row['lifecycle'], 'lifecycleAsOf': CATALOG['lifecycleAsOf'],
            'lifecycleDateMeaning': 'snapshot-observed', 'recordUnit': 'project', 'identityBasis': 'source-locator',
            'owner': None, 'sourceState': None, 'sourceLocation': normalized.get('sourceLocation'), 'sourceUpdatedOn': None,
            'parentProgramId': None, 'aliases': aliases, 'workType': 'Transmission line or substation work',
            'milestones': milestones, 'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['No native numerical project coordinates, CRS or accuracy are supplied in the selected text. Named endpoints, counties and map images are not resolved into geometry.'],
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    for artifact in CATALOG['artifacts']:
        if hashlib.sha256((args.originals_dir / artifact['file']).read_bytes()).hexdigest() != artifact['sha256']:
            raise ValueError('Source original differs from its accepted edition: ' + artifact['file'])
    retained = [row for row in CATALOG['rows'] if row['disposition'] == 'retain-transmission-project']
    if args.scope == 'full' and any('normalized' not in row for row in retained):
        raise ValueError('Only the accepted six-record sample is normalized. Full generation waits for coordinator provider connection and dispatch.')
    projects, ledger = [], []
    for row in CATALOG['rows']:
        entry = {key: value for key, value in row.items() if key not in ('normalized', 'disposition')}
        if row['disposition'] == 'exclude-explicitly-concluded':
            entry.update(disposition='excluded', reason='Explicit project-page notice says work concluded; actual completion date unknown.')
        elif row['disposition'] == 'supporting-page-no-extra-runtime-record':
            entry.update(disposition='excluded', reason='Supporting page for an already enumerated IRP unit; no additional runtime record.')
        elif args.scope == 'sample' and row['sourceId'] not in SAMPLE:
            entry.update(disposition='pending', reason='Accepted retained source observation awaiting normalization after provider connection.')
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'], reason='Accepted transmission-work source observation with explicit snapshot and uncertainty meanings.')
        ledger.append(entry)
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    manifest = {
        'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'label': CATALOG['label'],
        'reportingGroupId': SOURCE, 'reportingGroupName': CATALOG['reportingGroupName'],
        'publisher': CATALOG['publisher'], 'processAuthority': 'Santee Cooper public transmission planning; cited SCPSC certificate decisions',
        'publishedOn': None, 'retrievedOn': CATALOG['retrievedOn'],
        'source': ref(CATALOG['sourceFile'], CATALOG['sourceLocator']), 'sha256': ARTIFACTS[CATALOG['sourceFile']]['sha256'],
        'geographicScope': 'Santee Cooper South Carolina public transmission planning scope; per-record states are not inferred.',
        'inventoryScope': 'Complete union of 23 named 2025 IRP Appendix B headings and 12 public project-index cards: 24 retained observations, two concluded-work exclusions and nine supporting-page exclusions.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()],
        'limitations': [
            'The union is a finite public subset, not a complete utility/statewide inventory or a count of unique engineering projects. Possible Seaboard–Indian Field / Indian Field–Varnville overlap is unresolved.',
            'Composite snapshot observed September 30, 2026 has no single publication date. Downloaded IRP carries a November 21, 2025 filing stamp, distinct from the library\'s initial September 16 filing; webpages have no verified update date.',
            'Active means listed project work, not construction. Three reported certificates support approved; Marion–Conway current lifecycle is unknown despite a historical April 2022 clearing statement. Elapsed forecasts do not prove approval, construction or completion.',
            'IRP completion years retain year precision and unknown kind. Explicit website service targets retain supplied precision. Coarse seasons and construction-end months are distinct from energization and administrative closeout.',
            'Bluffton retains an unknown primary date because IRP 2030 completion and an undated 2028 website service forecast conflict; county descriptions also differ.',
            'All owners, locations, native geometry, construction windows, actual start days and row-update days remain unknown. The operator\'s network includes Authority-owned and Central-owned equipment.',
            'Stable identities are source locators, not native engineering IDs. Named multi-circuit/station packages remain intact; regulatory docket/order references are aliases, not engineering identifiers.',
            'All 17 public originals are checksum-pinned in the producer catalog and row ledger. Primary manifest hash identifies the IRP, not the composite files. Public accessibility is not a blanket redistribution license.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': CATALOG['label'] + ' — ' + args.scope,
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                            'notes': [f"35 source observations = {len(projects)} imported + 11 excluded + {counts['pendingRows']} pending.",
                                      'Accepted factual catalog normalized against unchanged checksum-pinned originals; unknown ownership and geography remain unknown.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope,
                  'artifacts': CATALOG['artifacts'], 'counts': counts,
                  'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
                  'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
                  'completeRetainedLifecycleCounts': dict(Counter(row['lifecycle'] for row in retained)), 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope, 'records': len(projects),
             'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
             'measurement': 'Source-only Dataset2 UTF-8 JSON including final newline; aggregate/export envelope can be larger.',
             'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for filename, value in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / filename).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'counts': counts, 'lifecycleCounts': row_ledger['lifecycleCounts'],
                      'completeRetainedLifecycleCounts': row_ledger['completeRetainedLifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
