#!/usr/bin/env python3
"""Normalize the accepted, frozen TVA public-index factual catalog without inference."""
import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path

SOURCE = 'tva-public'
GROUP = 'Tennessee Valley Authority'
LABEL = 'TVA public transmission-project index — September 30, 2026 captured text'
DUPLICATE_REASON = 'Duplicate Appalachia placement under Tennessee; retained once under North Carolina.'


def project(table, row):
    facts = row['facts']
    return {
        'id': SOURCE + ':' + row['sourceId'], 'utilityId': SOURCE, 'sourceId': row['sourceId'],
        'sponsor': GROUP, 'name': row['title'], 'description': facts['description'],
        'status': facts['status'], 'voltageKv': facts['voltageKv'], 'date': facts['date'],
        'buildWindow': None, 'location': None, 'sources': facts['sources'], 'notes': facts['notes'],
        'inventory': {
            'sourceKey': SOURCE, 'editionId': table['editionId'], 'editionLabel': LABEL,
            'reportingGroupName': GROUP, 'identityBasis': 'source-locator',
            'recordKind': 'transmission-project', 'lifecycle': facts['lifecycle'],
            'lifecycleAsOf': facts['lifecycleAsOf'], 'lifecycleDateMeaning': facts['lifecycleDateMeaning'],
            'owner': None, 'sourceState': facts['sourceState'], 'sourceLocation': facts['sourceLocation'],
            'sourceUpdatedOn': facts['sourceUpdatedOn'], 'milestones': facts['milestones'],
            'parentProgramId': None, 'aliases': facts['aliases'], 'workType': facts['workType'],
            'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown', 'locationAssumptions': [],
        },
    }


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parents[3]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', choices=['sample', 'full'], default='sample')
    parser.add_argument('--source-dir', type=Path, default=root / 'inputs/originals/F27-tva-public')
    parser.add_argument('--output-dir', type=Path, default=root / 'app/src/data/real/coverage/tva-public')
    args = parser.parse_args()
    table = json.loads((script_dir / 'source-records.json').read_text())
    # A changed public page must receive a new reviewed edition, not silently replace these facts.
    for source in table['sources']:
        path = args.source_dir / source['file']
        data = path.read_bytes()
        if len(data) != source['bytes'] or hashlib.sha256(data).hexdigest() != source['sha256']:
            raise SystemExit('Captured artifact differs from the accepted edition: ' + source['file'])
    retained = [row for row in table['rows'] if not row['excluded']]
    if args.scope == 'full' and any(row['facts'] is None for row in retained):
        raise SystemExit('Full transcription remains pending; connect the six-record sample before completing the remaining 34 pages.')
    selected = set(table['sampleIds']) if args.scope == 'sample' else {row['sourceId'] for row in retained}
    projects, ledger = [], []
    for row in table['rows']:
        if row['excluded']:
            disposition, reason = 'excluded', DUPLICATE_REASON
        elif row['sourceId'] not in selected or row['facts'] is None:
            disposition, reason = 'pending', 'Accepted unique page work unit; normalization pending outside this sample.'
        else:
            disposition, reason = 'imported', 'One accepted page-scoped transmission work unit; component scopes are not extra records.'
            projects.append(project(table, row))
        ledger.append({
            'placementId': row['placementId'], 'stateSection': row['stateSection'],
            'sourceId': row['sourceId'], 'title': row['title'], 'canonicalUrl': row['canonicalUrl'],
            'identityBasis': 'source-locator', 'nativeEngineeringProjectId': None,
            'disposition': disposition, 'reason': reason,
            'duplicateOfSourceId': row['duplicateOfSourceId'], 'duplicateOfPlacementId': row['duplicateOfPlacementId'],
            'source': row['source'],
        })
    counts = {
        'sourceRows': len(ledger), 'importedRecords': len(projects),
        'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger), 'failedRows': 0,
        'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0,
    }
    index = table['sources'][0]
    limitations = [
        'The 41 placements cover only this captured public engagement index: 40 unique page-scoped work units and one duplicate Appalachia placement. Full scope is not a complete TVA or state engineering register.',
        'The primary SHA-256 identifies web-tool extracted text, not publisher HTML. Ordinary HTML acquisition returned 403; the coordinator explicitly accepted derived captures as frozen evidence. Separate public GIS JSON artifacts are originals.',
        'Georgia and Virginia have empty index sections, which do not establish zero projects. Project geography may differ from the section; public meeting addresses are not project locations.',
        'One page may combine line, station and connection work. Alternatives, existing assets and future separate work without an index link are not additional records.',
        'Canonical URL slugs are source-locator identities, not engineering IDs. GIS PROJECT_ID values remain scoped aliases; future edition continuity needs explicit crosswalks.',
        'Lifecycle belongs to the dated source statement or undated snapshot observation, not present construction status. Elapsed forecasts, preferred routes and acquired easements do not establish completion, approval or construction.',
        'Seasonal forecasts retain year precision and their source labels. Cross-year winters, conflicts and withdrawn schedules keep unknown primary dates; historical/component milestones remain supplemental.',
        'Owners, centers, native geometry and construction intervals remain unknown. TVA is the reporting sponsor. Public proposed polylines have scope/status mismatches and are not converted to centers.',
    ]
    edition = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'label': LABEL,
        'reportingGroupId': SOURCE, 'reportingGroupName': GROUP, 'publisher': GROUP,
        'processAuthority': None, 'publishedOn': None, 'retrievedOn': table['retrievedOn'],
        'source': {'file': index['file'], 'url': index['url'],
                   'locator': 'Derived web-tool text capture, state-section project links; 41 placements / 40 unique URLs; not original HTML'},
        'sha256': index['sha256'],
        'geographicScope': 'Captured index sections span Alabama, Kentucky, Mississippi, North Carolina and Tennessee; Georgia/Virginia sections have no links, not a zero-project claim. Some projects cross section/state boundaries.',
        'inventoryScope': 'All 41 current-index placements: 40 unique public transmission page work units and one excluded duplicate Appalachia placement. No claim of utility-wide or state-wide capital-inventory completeness.',
        'scope': args.scope, 'counts': counts,
        'exclusions': [{'reason': DUPLICATE_REASON, 'count': counts['excludedRows']}], 'limitations': limitations,
    }
    dataset = {
        'schemaVersion': 2, 'mode': 'real', 'title': 'TVA public transmission-project index — ' + args.scope,
        'generatedAt': table['generatedAt'], 'projects': projects, 'sourceEditions': [edition],
        'coverage': {'processed': len(projects), 'skipped': counts['excludedRows'], 'failed': 0,
                     'notes': [str(counts['pendingRows']) + ' accepted unique page work units remain pending in this snapshot.',
                               'Derived page-text captures are explicitly accepted evidence, not original HTML or a live engineering-status register.']},
    }
    formatted = json.dumps(dataset, ensure_ascii=False, indent=2) + '\n'
    compact = json.dumps(dataset, ensure_ascii=False, separators=(',', ':'))
    sizes = {'compactUtf8Bytes': len(compact.encode('utf-8')), 'formattedUtf8Bytes': len(formatted.encode('utf-8'))}
    quality = {
        'sourceKey': SOURCE, 'editionId': table['editionId'], 'scope': args.scope,
        'normalizationMethod': 'Cited factual catalog pinned to exact preserved artifact bytes; no changing-page fetch, map interpretation or inference.',
        'capturePolicy': table['capturePolicy'], 'rawPublisherHtmlAvailable': False,
        'capturedTextArtifacts': 41, 'originalPublicGisJsonArtifacts': 14,
        'artifactCatalog': 'source-catalog.json', 'acceptedFullLifecycleCounts': table['acceptedFullLifecycleCounts'],
        'importedLifecycleCounts': dict(Counter(p['inventory']['lifecycle'] for p in projects)),
        'importedDatePrecisionCounts': dict(Counter(p['date']['precision'] for p in projects)),
        'unknownOwnerRecords': len(projects), 'unknownLocationRecords': len(projects),
        'unknownConstructionWindowRecords': len(projects), 'sampleIds': [SOURCE + ':' + value for value in table['sampleIds']],
        'geometryContext': table['geometryContext'], 'relationshipsAndPrecedence': limitations,
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'dataset.json').write_text(formatted)
    write_json(args.output_dir / 'manifest.json', edition)
    write_json(args.output_dir / 'row-ledger.json', {'sourceKey': SOURCE, 'editionId': table['editionId'], 'counts': counts, 'payloadSizes': sizes, 'rows': ledger})
    write_json(args.output_dir / 'source-catalog.json', {'sourceKey': SOURCE, 'editionId': table['editionId'], 'capturePolicy': table['capturePolicy'], 'sources': table['sources']})
    write_json(args.output_dir / 'source-quality.json', quality)
    (args.output_dir / 'README.md').write_text(f'''# TVA public transmission-project index — {args.scope}

Dataset version 2: {counts['sourceRows']} index placements = {counts['importedRecords']} imported + {counts['excludedRows']} duplicate excluded + {counts['pendingRows']} pending, with zero failed or located. Full accepted scope is 40 page work units, not TVA-wide or state-wide engineering coverage. Multi-part line/station work is not split into invented records.

The six diagnostics are New Liberty, Kentucky Phase II, Beulah Grove, Appalachia, Shooting Creek and Hardin Valley. Operating/design voltage, explicit hold/restart, separate component schedules and historical construction evidence remain distinct. Seasonal forecasts preserve source labels; contradictory or cross-year dates remain unknown. Owners, centers/native geometry and actual construction windows are null.

`manifest.json` matches the embedded edition `observed-2026-09-30`. Its primary hash identifies the derived index text capture, never original HTML. Ordinary HTML downloads returned 403; the coordinator accepted captured text. `source-catalog.json` separately identifies all 41 text captures and 14 original public GIS JSON responses by URL, size and SHA-256. `source-quality.json` preserves capture meaning and GIS scope/status conflicts; no route geometry is converted to a center. Artifacts remain ignored under `inputs/originals/F27-tva-public/` in the UI worktree.

`row-ledger.json` retains every index placement and links the excluded Tennessee Appalachia placement to its retained North Carolina placement. The sample is ready for coordinator provider connection before the other 34 unique pages are normalized. Payload: {sizes['compactUtf8Bytes']} compact UTF-8 bytes / {sizes['formattedUtf8Bytes']} formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/tva-public/extract.py --scope {args.scope}` and the preserved artifacts. Coordinator owns runtime validation and provider integration; no worker checks were run.
''')
    print(json.dumps({'scope': args.scope, 'counts': counts, **sizes}))


if __name__ == '__main__':
    main()
