#!/usr/bin/env python3
"""Normalize the accepted CTPC factual catalog against unchanged public source originals."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name('catalog.json').read_text())
SOURCE = CATALOG['sourceKey']
SAMPLE = set(CATALOG['sampleSourceIds'])
PLAN = next(item for item in CATALOG['artifacts'] if item['file'] == '2026-04-16-final-plan.pdf')


def update_ref(locator):
    return {'file': CATALOG['sourceFile'], 'url': CATALOG['sourceUrl'], 'locator': locator}


def plan_ref(locator):
    return {'file': PLAN['file'], 'url': PLAN['url'], 'locator': locator}


def classification(row):
    return 'planning-context' if row['sourceStatus'] == 'Conceptual' else 'transmission-project'


def lifecycle(row):
    return {'Conceptual': 'unknown', 'In-Service': 'in-service', 'Removed': 'cancelled'}.get(row['sourceStatus'], 'planned')


def project(row):
    raw, proposal, citation = row['raw'], row['proposed'], row['source']
    refs = [citation, update_ref('PDF/printed pp.13,16,17, footnotes 1–2: status and estimated nominal cost meanings'),
            *CATALOG['dateEvidence']]
    owner = None
    owner_rule = CATALOG['ownerEvidence']['rules'][raw['transmissionOwner']]
    if owner_rule:
        owner_refs = [citation, CATALOG['ownerEvidence']['definition'], CATALOG['ownerEvidence']['aliases']]
        owner = {**owner_rule, 'evidence': owner_refs}
        refs.extend(owner_refs[1:])
    if row['sourceId'] == 'W210482':
        refs.extend([update_ref('PDF/printed p.3, W210482 duplicate-removal change and p.9 surviving row'),
                     plan_ref('Appendix C, PDF pp.64,67 / printed pp.62,65: repeated W210482 before duplicate removal')])
    if row['sourceId'] in ('MVSTDEC02', 'MVSTDEP01', 'MVSTDEC03'):
        refs.append(update_ref('PDF/printed p.17, note below MVST table: conceptual options unapproved and excluded from update approval totals'))
    if row['sourceId'] == 'W200034':
        refs.append(update_ref('PDF/printed p.4, W230387 explicitly combined into W200034'))
    if row['sourceId'] == 'MVSTDEC01':
        refs.append(update_ref('PDF/printed p.2, CTPCDEC02 moved to MVST without an explicit destination ID crosswalk'))
    notes = [
        f"Source category: {row['section']}. Issue resolved: {raw['issueResolved']}",
        f"Raw source status: {raw['status']}. Status is as of the August 2026 source edition, not the retrieval date.",
        f"Raw estimated in-service target: {raw['estimatedInServiceDate']}. The reported target does not establish actual completion.",
        f"Source estimated cost: {raw['estimatedCostMillionNominalUsd']} million nominal USD. These rounded estimated expenditures are not a coordination benefit; a dash means unknown.",
        'Source cost includes direct costs, loadings and overheads; excludes AFUDC. Source p.1 gives rounding rules.',
        f"Source Transmission Owner token: {raw['transmissionOwner']}. Singular owner identities are source-scoped; no global parent or cross-source equivalence is established.",
        *row.get('notes', []),
        'Named facilities and endpoints are description text only. No project coordinates, construction start, construction window or row-update day is supplied.',
    ]
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': raw['transmissionOwner'], 'name': raw['project'], 'description': raw['project'],
        'status': raw['status'], 'voltageKv': proposal['voltageKv'], 'date': proposal['date'],
        'buildWindow': None, 'location': None, 'sources': refs, 'notes': notes,
        'inventory': {
            'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'editionLabel': CATALOG['label'],
            'reportingGroupName': CATALOG['reportingGroupName'], 'recordKind': classification(row),
            'lifecycle': lifecycle(row), 'lifecycleAsOf': CATALOG['lifecycleAsOf'],
            'lifecycleDateMeaning': 'source-edition', 'recordUnit': 'project', 'identityBasis': 'native-id',
            'owner': owner, 'sourceState': None, 'sourceLocation': None, 'sourceUpdatedOn': None,
            'parentProgramId': None, 'aliases': [], 'workType': row['section'],
            'milestones': [{'field': 'Estimated In-Service Date (raw: ' + raw['estimatedInServiceDate'] + ')',
                            'date': proposal['date'], 'evidence': [citation, *CATALOG['dateEvidence']]}],
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
            'locationAssumptions': ['No native coordinate/CRS/accuracy field is supplied. Names, operating areas and map images are not interpreted as project geometry.'],
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--originals-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    for item in CATALOG['artifacts']:
        if hashlib.sha256((args.originals_dir / item['file']).read_bytes()).hexdigest() != item['sha256']:
            raise ValueError('Public source original differs from its accepted edition: ' + item['file'])
    retained = [row for row in CATALOG['rows'] if row['disposition'].startswith('retain-')]
    if args.scope == 'full' and any('proposed' not in row for row in retained):
        raise ValueError('Only the accepted connection sample is normalized. Complete remaining source cells after coordinator dispatch before full generation.')
    projects, ledger = [], []
    for row in CATALOG['rows']:
        entry = {key: row[key] for key in ['sourceRow', 'sourceId', 'section', 'source', 'raw']}
        entry.update(recordKind=classification(row), lifecycle=lifecycle(row))
        if row['disposition'] == 'exclude-in-service':
            entry.update(disposition='excluded', reason='Source status In-Service: operational, outside remaining planned scope.')
        elif row['disposition'] == 'exclude-removed':
            entry.update(disposition='excluded', reason='Source status Removed: no longer active in this table; cancelled, combined or reassigned per source notes.')
        elif args.scope == 'sample' and row['sourceId'] not in SAMPLE:
            entry.update(disposition='pending', reason='Accepted retained row awaiting normalization after the connection sample.')
        else:
            record = project(row)
            projects.append(record)
            entry.update(disposition='imported', projectId=record['id'], reason='Conceptual option retained only as planning context.' if classification(row) == 'planning-context' else 'Accepted physical transmission project; lifecycle conservatively planned.')
        ledger.append(entry)
    exclusions = Counter(row['reason'] for row in ledger if row['disposition'] == 'excluded')
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(exclusions.values()),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    manifest = {
        'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'label': CATALOG['label'],
        'reportingGroupId': SOURCE, 'reportingGroupName': CATALOG['reportingGroupName'],
        'publisher': CATALOG['publisher'], 'processAuthority': 'CTPC collaborative transmission planning process',
        'publishedOn': CATALOG['publishedOn'], 'retrievedOn': CATALOG['retrievedOn'],
        'source': update_ref(CATALOG['sourceLocator']), 'sha256': CATALOG['sourceSha256'],
        'geographicScope': 'DEC/DEP participant areas in North Carolina and South Carolina; no per-row jurisdiction inferred.',
        'inventoryScope': 'All 120 Project ID rows in August 2026 update pp.8–17: 98 reliability, 17 public policy, five MVST. Retain 89 transmission and nine conceptual planning-context observations; exclude 17 In-Service and five Removed rows.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': reason, 'count': count} for reason, count in exclusions.items()],
        'limitations': [
            'The complete declared update scope is not all North/South Carolina projects. No extra monetary threshold is applied; prior plan tables, change summaries, models and alternative lists are not additional rows.',
            'Publication day is the official index posting date August 14, 2026; document status has August 2026 precision. Filename August 13 is not a row update date.',
            'Underway spans budget provision through some construction and cannot establish physical construction. It and Planned normalize to planned; Conceptual is planning-context/unknown, never an approved project.',
            'June 1/December 1 represent peak-season service targets, not precise days. Normalized dates retain only the displayed calendar year; raw targets remain visible. Winter crosses years and no interval is inferred.',
            'Non-placeholder E200161 June 30, 2026 is a reported estimated day, despite the still-Underway status; no completion is inferred from elapsed forecasts.',
            'DEC/DEP singular row tokens identify source-scoped responsible equipment owners. Composite DEC/DEP remains null owner; no global owner registry or cross-source corporate distinction is established.',
            'All locations, native geometry, construction windows and row-update days remain unknown. Voltage derives only from explicitly named kV scope; missing values stay empty.',
            'Nine Conceptual entries remain contextual; three MVST concepts are explicitly unapproved and excluded from approved update cost/schedule totals.',
            'W210482 survives once after duplicate removal; removed/combined/reassigned IDs are not additional active rows. Cross-source identity remains unresolved.',
            'Source costs are rounded estimated nominal expenditures, not benefits. Public availability does not establish blanket redistribution permission.',
        ],
    }
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': CATALOG['label'] + ' — ' + args.scope,
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                            'notes': [f"120 source rows = {len(projects)} imported + 22 excluded + {counts['pendingRows']} pending.",
                                      'Accepted public factual catalog normalized against all checksum-pinned originals; source scope and unknown geography preserved.']}}
    row_ledger = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope,
                  'sourceSha256': CATALOG['sourceSha256'], 'counts': counts,
                  'rawStatusCounts': dict(Counter(row['sourceStatus'] for row in CATALOG['rows'])),
                  'recordKindCounts': dict(Counter(p['inventory']['recordKind'] for p in projects)),
                  'lifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
                  'completeRetainedRecordKindCounts': dict(Counter(classification(row) for row in retained)),
                  'completeRetainedLifecycleCounts': dict(Counter(lifecycle(row) for row in retained)), 'rows': ledger}
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    sizes = {'sourceKey': SOURCE, 'editionId': CATALOG['editionId'], 'scope': args.scope, 'records': len(projects),
             'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedDownloadUtf8Bytes': len(formatted.encode('utf-8')),
             'measurement': 'Source-only Dataset2 UTF-8 JSON including final newline; aggregate/export envelope can be larger.',
             'datasetFileFormat': 'compact' if args.scope == 'full' else 'formatted'}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(compact if args.scope == 'full' else formatted)
    for fn, value in [('manifest.json', manifest), ('row-ledger.json', row_ledger), ('payload-sizes.json', sizes)]:
        (args.output_dir / fn).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'counts': counts, 'recordKindCounts': row_ledger['recordKindCounts'], 'lifecycleCounts': row_ledger['lifecycleCounts'], 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
