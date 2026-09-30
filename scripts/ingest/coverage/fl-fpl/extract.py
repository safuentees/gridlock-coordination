#!/usr/bin/env python3
"""Project the accepted FPL public transmission scopes from hash-pinned PDF text."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

from pypdf import PdfReader

KEY = 'fl-fpl'
EDITION = '2026-04'
GROUP = 'Florida Power & Light public plan'
LABEL = 'FPL April 2026 transmission planning scopes'
FILE = 'fpl-2026-plan.pdf'
URL = 'https://www.fpl.com/content/dam/fplgp/us/en/about/pdf/ten-year-site-plan.pdf'
SHA = '30231eb609f4011fa579030e2294483cb7f34c58aed1a05b72eed1055ddecedd'
ORIGINALS = [
    {'file': FILE, 'url': URL, 'sha256': SHA},
    {'file': 'fpl-2026-index.html', 'url': 'https://www.fpl.com/about/10-year-site-plan.html',
     'sha256': '093a5273ae8cff324c2313a342e33dc1a23a0eb77a64ce619695847ee5c0c195'},
]
EXCLUDED = {5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 57, 59, 61, 63, 65, 69, 71, 73, 75, 77, 79}
SAMPLE_IDS = {'iii-e1-r01', 'iii-e1-r02', 's10-001', 's10-013', 's10-023'}
EXCLUSION_REASON = 'storage-collector-side-only-no-transmission-work'
# The five source table rows are fixed factual cells, not derived lines or parent records.
BULK = [
    ('Sweatt', 'Whidden', 79, '2026-06', 230, 1195),
    ('Oasis', 'Andytown', 30, '2031-12', 500, 3464),
    ('Oasis', 'Quarry', 15, '2033-12', 500, 3464),
    ('Quarry', 'Oasis', 15, '2033-12', 230, 1195),
    ('Levee', 'Oasis', 15, '2033-12', 230, 1195),
]
KNOWN_NOTES = {
    13: ['Schedule 10 and the narrative line/terminal work state 115 kV. III.E.13 item I.1 calls the new substation 230/34.5 kV, while later transformer work states 115/34.5 kV. Preserve this source discrepancy; line voltage is not silently changed to match the station phrase.'],
    21: ['Schedule 10 reports zero lines; III.E.21 explicitly adds 500 kV bus/transformer/breaker work. This is a transmission-side modification, not an invented line.'],
    23: ['Schedule 10 names Apricot as origin/termination; III.E.23 describes work from Witt to Apricot. The different endpoint context is unresolved.'],
    31: ['The Schedule 10 heading identifies Orange Blossom but its narrative sentence names Sawgrass. III.E.31 identifies Orange Blossom; preserve this discrepancy on the excluded source entry.'],
    42: ['Schedule 10 names Chinkapin; III.E.42 describes work from Witt to a new Chinkapin. Preserve both source meanings without a guessed route.'],
    43: ['Schedule 10 names Lemur and spells the narrative facility Mayakka; III.E.43 identifies Myakka and describes work from Witt to Lemur. Do not repair or merge the source names.'],
    44: ['Schedule 10 names Stallion; III.E.44 describes work from Witt to a new Stallion. Preserve both source meanings without a guessed route.'],
    46: ['Schedule 10 names Vernia; III.E.46 describes an extension from Vernia to a new Ambersweet substation. Preserve each field meaning.'],
    56: ['The narrative uses both Lily and Lilly. Preserve the source spellings; no substation identity crosswalk is inferred.'],
    58: ['Schedule 10 uses Lilly, whereas III.E.58 uses Lily; neighboring form 59 also uses Lily. Preserve the source spellings without an inferred identity merge.'],
    62: ['Schedule 10 describes an extension from Flatford to Owen; III.E.62 describes bus work at Owen. Preserve source endpoint context without inventing a route.'],
    76: ['The Schedule 10 heading identifies Leafcutter but its narrative sentence names Grapefruit. III.E.76 identifies Leafcutter; retain the heading identity and mismatch.'],
    82: ['Schedule 10 spells the name Limkin, whereas III.E.82 says Limpkin. Keep the frozen form identity and the alternate source spelling.'],
    83: ['Schedule 10 names Lake Butler–Plum in the narrative, while III.E.83 names Butler–Plum. Retain the differing source names; no endpoint match is inferred.'],
}


def source(locator):
    return {'file': FILE, 'url': URL, 'locator': locator}


def form_source(number, detail='items (1)–(9)'):
    return source(f'Schedule 10, form {number}/84, printed p.{314 + number} / PDF p.{328 + number}; {detail}')


def narrative_source(number):
    return source(f'III.E.{number}, printed p.{96 + number} / PDF p.{110 + number}; projected interconnection work')


def bulk_source(number, detail='columns (1)–(7)'):
    return source(f'Table III.E.1, printed p.96 / PDF p.110, row {number}; {detail}')


def date(value=None, precision='unknown', kind='unknown', label='Transmission in-service date not explicitly stated'):
    return {'value': value, 'precision': precision, 'kind': kind, 'label': label}


def milestone(field, value, precision, label, evidence, kind='unknown'):
    return {'field': field, 'date': date(value, precision, kind, label), 'evidence': [evidence]}


def read_forms(original_dir):
    for original in ORIGINALS:
        if hashlib.sha256((original_dir / original['file']).read_bytes()).hexdigest() != original['sha256']:
            raise ValueError(f"Original differs from accepted edition: {original['file']}")
    reader = PdfReader(original_dir / FILE)
    if len(reader.pages) != 441:
        raise ValueError('Accepted public-plan page boundary changed.')
    forms = []
    for number in range(1, 85):
        # Extract only the accepted forms and matched public narratives, never metadata/maps.
        text = ' '.join((reader.pages[327 + number].extract_text() or '').split())
        narrative = ' '.join((reader.pages[109 + number].extract_text() or '').split())
        heading = re.search(r'Page (\d+) of 84 Schedule 10 Status Report and Specifications of Proposed Transmission Lines (.*?) \(1\)', text)
        if not heading or int(heading[1]) != number or not re.search(r'III\.E\.\s*' + str(number) + r'\s', narrative):
            raise ValueError(f'Accepted form/narrative locator changed: {number}')
        fields = {}
        for field in range(1, 9):
            match = re.search(r'\(' + str(field) + r'\) (.*?)(?=\(' + str(field + 1) + r'\))', text)
            if not match:
                raise ValueError(f'Expected field {field} missing on form {number}')
            fields[field] = match[1].strip()
        voltage = re.fullmatch(r'Voltage: (\d+) kV', fields[5])
        timing = re.fullmatch(r'Anticipated Construction Timing: Start date: (\d{4}) End date: (\d{4})', fields[6])
        quarter = re.search(r'([1-4])\s*(?:st|nd|rd|th) Quarter of (\d{4})', narrative)
        county = re.search(r'\((.*?) County\)$', heading[2])
        capacity = re.search(r'approximat(?:e|ely)\s+([\d.]+) MW', narrative)
        if not voltage or not timing or not quarter or not county or not capacity:
            raise ValueError(f'Accepted source meaning is not parseable on form {number}')
        if number in EXCLUDED and ('existing 34.5 kV bus' not in narrative or 'No additional transmission work is required.' not in narrative):
            raise ValueError(f'Storage-side-only exclusion evidence changed: {number}')
        if fields[3] != 'Right-of-way FPL – Owned' or 'Participation with Other Utilities: None' not in text:
            raise ValueError(f'Accepted right-of-way/participation context changed: {number}')
        forms.append({
            'number': number, 'sourceId': f's10-{number:03d}', 'name': heading[2], 'county': county[1] + ' County',
            'originAndTermination': fields[1].removeprefix('Point of Origin and Termination:').strip(),
            'numberOfLines': int(fields[2].removeprefix('Number of Lines:').strip()),
            'lineLength': fields[4].removeprefix('Line Length:').strip(), 'lineVoltageKv': int(voltage[1]),
            'constructionStartYear': timing[1], 'constructionEndYear': timing[2],
            'projectedConnectionQuarter': quarter[0], 'projectedConnectionYear': quarter[2],
            'servedCapacityMw': float(capacity[1]),
            'transformerMva': sorted({float(value) for value in re.findall(r'([\d.]+) MVA', narrative)}),
            'substations': fields[8].removeprefix('Substations:').strip(),
            'rightOfWay': 'FPL-owned', 'otherUtilityParticipation': 'None',
            'investmentMeaning': 'Transmission/substation amount included in Schedule 9 total installed generation cost; no separate amount supplied.',
            'excluded': number in EXCLUDED,
        })
    if len(forms) != 84 or sum(row['excluded'] for row in forms) != 34 or sum(row['numberOfLines'] == 0 for row in forms) != 1:
        raise ValueError('Accepted form enumeration changed.')
    return forms


def inventory(source_id, unit, lifecycle, source_location, owner, milestones, aliases, work_type):
    return {
        'sourceKey': KEY, 'editionId': EDITION, 'editionLabel': LABEL, 'reportingGroupName': GROUP,
        'recordKind': 'transmission-project', 'recordUnit': unit, 'identityBasis': 'source-locator',
        'lifecycle': lifecycle, 'lifecycleAsOf': EDITION, 'lifecycleDateMeaning': 'source-edition',
        'sourceUpdatedOn': None, 'sourceState': None, 'sourceLocation': source_location,
        'owner': owner, 'parentProgramId': None, 'aliases': aliases, 'workType': work_type,
        'constructionStart': None, 'nativeGeometry': None, 'centerRole': 'unknown',
        'locationAssumptions': ['Source county/terminal names, miles and right-of-way do not provide native coordinates, a qualified center, CRS or accuracy. No maps or geocoding were used.'],
        'milestones': milestones,
    }


def make_bulk(number):
    to, from_, miles, service, voltage, capacity = BULK[number - 1]
    source_id = f'iii-e1-r{number:02d}'
    evidence = bulk_source(number)
    notes = [f'Table III.E.1: From={from_}; To={to}; circuit miles={miles}; nominal voltage={voltage} kV; capacity={capacity:,} MVA. Capacity is not voltage or a savings estimate.',
             'This is a proposed bulk-line table entry requiring siting certification. Elapsed forecasts do not establish construction progress or completion.',
             'Identity uses a frozen source position, not a native engineering ID. Future editions require an explicit identity crosswalk; source names alone do not merge FMPA observations.']
    if number == 1:
        status, lifecycle, unit = 'Need approved; certification conditions received', 'approved', 'project'
        footnote = source('Table III.E.1, printed p.96 / PDF p.110, footnote 1')
        milestones = [milestone('Need determination approval', '2022-05-17', 'day', 'Need determination approved', footnote),
                      milestone('Certification conditions received', '2022-09', 'month', 'Conditions of certification received', footnote)]
        aliases = []
        notes.append('Footnote 1 gives need approval on May 17, 2022 and certification conditions in September 2022; it schedules completion in June 2026 without confirming an actual event.')
    else:
        status, lifecycle, unit = 'Proposed; need determination application filed', 'planned', 'component'
        footnote = source('Table III.E.1, printed p.96 / PDF p.110, footnote 2')
        milestones = [milestone('Program need determination filing', '2026-03-11', 'day', 'Need determination application filed; not approval', footnote),
                      milestone('Overall program planned in-service', '2033-12', 'month', 'Andytown–Oasis program planned in-service', footnote, kind='in-service')]
        aliases = ['Andytown-Oasis Transmission Lines Project']
        notes.append('Footnote 2 groups four related lines in the Andytown–Oasis program. Keep each line and its own date; the overall December 2033 forecast does not replace row 2 December 2031. No synthetic parent record or ID is created.')
    owner = {'id': KEY, 'name': 'Florida Power & Light Company', 'identityScope': 'source', 'evidence': [bulk_source(number, 'column (1), Line Ownership=FPL')]}
    return {'id': f'{KEY}:{source_id}', 'sourceId': source_id, 'utilityId': KEY, 'sponsor': None,
            'name': f'{from_}–{to} {voltage} kV transmission line',
            'description': f'Proposed {miles}-circuit-mile {voltage} kV line from {from_} to {to}; source capacity {capacity:,} MVA.',
            'status': status, 'voltageKv': [voltage], 'date': date(service, 'month', 'in-service', 'Projected commercial in-service'),
            'buildWindow': None, 'location': None, 'sources': [evidence, footnote], 'notes': notes,
            'inventory': inventory(source_id, unit, lifecycle, f'From: {from_}; To: {to}', owner, milestones, aliases, 'Proposed bulk transmission line')}


def form_notes(row):
    number = row['number']
    notes = [f"Schedule 10 connection context: {row['numberOfLines']} reported line(s), length {row['lineLength']}, line voltage {row['lineVoltageKv']} kV; origin/termination: {row['originAndTermination']}; substations: {row['substations']}.",
             f"The served facility has projected nameplate capacity {row['servedCapacityMw']:g} MW in III.E.{number}; this describes generation/storage, not transmission capacity or voltage.",
             'Right-of-way is reported FPL-owned and other utility participation is None. Those statements do not establish ownership of every transmission/interconnection asset.',
             row['investmentMeaning'],
             'Anticipated construction years and a projected connection quarter are different source statements, not actual construction bounds or an explicit transmission in-service date.',
             'The plan treats forecasts as tentative; printed page 96 says longer-term sites are not definitive and transmission analyses may be incomplete. Detailed proposed work is not a verified location or final design.']
    if row['transformerMva']:
        notes.append('Transformer capacities stated in the matched narrative: ' + ', '.join(f'{value:g} MVA' for value in row['transformerMva']) + '. Preserve equipment rating separately from line kV and served-facility MW; no conversion or aggregate is inferred.')
    if row['constructionEndYear'] != row['projectedConnectionYear']:
        notes.append(f"Timing discrepancy: Schedule 10 anticipated construction end is {row['constructionEndYear']}; III.E.{number} projects connection in {row['projectedConnectionQuarter']}. Preserve both without selecting an invented corrected date.")
    notes.extend(KNOWN_NOTES.get(number, []))
    if number in {13, 42, 44}:
        notes.append('Repeated source item (9) is one participation field, not an extra facility.')
    return notes


def make_form(row):
    number, source_id = row['number'], row['sourceId']
    evidence, narrative = form_source(number), narrative_source(number)
    milestones = [milestone('Schedule 10 anticipated construction start', row['constructionStartYear'], 'year', 'Anticipated construction start', form_source(number, 'item (6)')),
                  milestone('Schedule 10 anticipated construction end', row['constructionEndYear'], 'year', 'Anticipated construction end', form_source(number, 'item (6)')),
                  milestone('III.E projected connection timing', row['projectedConnectionYear'], 'year', row['projectedConnectionQuarter'] + '; exact quarter retained in label', narrative)]
    name = row['name'] + ' — transmission facilities'
    return {'id': f'{KEY}:{source_id}', 'sourceId': source_id, 'utilityId': KEY, 'sponsor': None,
            'name': name, 'description': f"Proposed transmission-side interconnection package for {row['name']}; the matched engineering narrative specifies bus, line, terminal, breaker, transformer or substation work. Source connection: {row['originAndTermination']}.",
            'status': 'Proposed transmission interconnection work', 'voltageKv': [row['lineVoltageKv']], 'date': date(),
            'buildWindow': None, 'location': None,
            'sources': [evidence, narrative, source('Printed p.1 / PDF p.15 and printed p.96 / PDF p.110; tentative planning/site limitations')],
            'notes': form_notes(row),
            'inventory': inventory(source_id, 'component', 'planned', row['county'] + '; ' + row['originAndTermination'], None, milestones, [row['name']], 'Transmission-side interconnection work package')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--scope', choices=('sample', 'full'), default='sample')
    parser.add_argument('--generated-at', default=datetime.now(timezone.utc).isoformat())
    args = parser.parse_args()
    forms = read_forms(args.original_dir)
    projects, ledger = [], []
    for number in range(1, 6):
        project = make_bulk(number)
        entry = {'sourceId': project['sourceId'], 'sourceName': project['name'], 'sources': project['sources'],
                 'scope': 'Table III.E.1 bulk line', 'row': number, 'recordKind': 'transmission-project', 'recordUnit': project['inventory']['recordUnit']}
        if args.scope == 'full' or project['sourceId'] in SAMPLE_IDS:
            projects.append(project); entry.update(disposition='imported', projectId=project['id'])
        else:
            entry.update(disposition='pending', reason='Accepted retained row; full normalization awaits sample connection.')
        ledger.append(entry)
    for row in forms:
        number, source_id = row['number'], row['sourceId']
        entry = {'sourceId': source_id, 'sourceName': row['name'], 'sources': [form_source(number), narrative_source(number)],
                 'scope': 'Schedule 10 interconnection work', 'form': number, 'sourceFacts': row}
        if row['excluded']:
            entry.update(disposition='excluded', reason=EXCLUSION_REASON,
                         evidenceSummary='The matched narrative specifies extension of an existing 34.5 kV BESS collector bus/protection and explicitly no additional transmission work or upgrades.',
                         notes=KNOWN_NOTES.get(number, []) + ([f"Schedule 10 construction end {row['constructionEndYear']} differs from narrative connection timing {row['projectedConnectionQuarter']}."] if row['constructionEndYear'] != row['projectedConnectionYear'] else []))
        elif args.scope == 'full' or source_id in SAMPLE_IDS:
            project = make_form(row); projects.append(project)
            entry.update(disposition='imported', projectId=project['id'], recordKind='transmission-project', recordUnit='component')
        else:
            entry.update(disposition='pending', reason='Accepted retained form; full normalization awaits sample connection.', recordKind='transmission-project', recordUnit='component')
        ledger.append(entry)
    imported = 55 if args.scope == 'full' else 5
    counts = {'sourceRows': len(ledger), 'importedRecords': len(projects), 'excludedRows': sum(row['disposition'] == 'excluded' for row in ledger),
              'failedRows': 0, 'pendingRows': sum(row['disposition'] == 'pending' for row in ledger), 'locatedRecords': 0}
    if counts != {'sourceRows': 89, 'importedRecords': imported, 'excludedRows': 34, 'failedRows': 0, 'pendingRows': 55 - imported, 'locatedRecords': 0}:
        raise ValueError('Accepted full-source reconciliation changed.')
    if len({row['sourceId'] for row in ledger}) != 89 or not SAMPLE_IDS.issubset({row['sourceId'] for row in ledger if row['disposition'] != 'excluded'}):
        raise ValueError('Frozen source identities or sample boundary changed.')
    limitations = [
        'Two finite primary scopes: five Table III.E.1 bulk rows plus 84 Schedule 10 forms. The 84 matching III.E narratives are support, not extra projects.',
        'Full accepted scope is 55 transmission work units; 34 storage-side collector/protection entries are excluded by explicit work scope, not a voltage cutoff.',
        'This FPL plan includes Northwest Florida but is not a complete Florida inventory or a known statewide denominator.',
        'April 2026 is submission/edition precision; publication day and row update dates are unknown. Analyses occurred in 2025 and Q1 2026; retrieval does not refresh lifecycle.',
        'Source-locator IDs freeze the initial source positions without an edition prefix. They are not native engineering IDs; every future edition requires an explicit identity crosswalk.',
        'Only five bulk rows evidence FPL line ownership, scoped to this source. Right-of-way/reporting identity/participation do not establish ownership of the 50 interconnection packages.',
        'Five bulk commercial-service dates have month precision. Fifty interconnection service dates remain unknown; construction years and connection quarters are supplementary, never invented actual windows.',
        'Separate line/program dates, source voltage, name and endpoint discrepancies and unresolved timing conflicts are preserved. No parent records, guessed centers or cross-source FMPA merges.',
        'Reported circuit miles, kV, transformer/capacity MVA and served-facility MW are distinct meanings. Schedule 9 total installed costs do not establish standalone transmission costs or savings.',
        'Source text calls forecasts tentative and longer-term sites nondefinitive; proposed equipment work is not a final location or design.',
        'Public factual private analysis only; originals, contact data, hidden metadata and maps are not published or interpreted. No open/commercial reuse license is asserted.',
    ]
    if args.scope == 'sample':
        limitations.append('Five retained diagnostics are emitted first; 50 accepted records await sample connection and full normalization.')
    manifest = {'sourceKey': KEY, 'editionId': EDITION, 'label': LABEL, 'reportingGroupId': KEY, 'reportingGroupName': GROUP,
                'publisher': 'Florida Power & Light Company', 'processAuthority': 'Florida Public Service Commission ten-year site planning',
                'publishedOn': None, 'retrievedOn': '2026-09-30',
                'source': source('Table III.E.1 printed p.96 / PDF p.110, rows 1–5; Schedule 10 printed pp.315–398 / PDF pp.329–412, forms 1–84; matched III.E.1–84 narratives'), 'sha256': SHA,
                'geographicScope': 'Partial FPL Florida and Northwest Florida utility planning scope, with named counties/terminals only; not statewide completeness.',
                'inventoryScope': '89 primary source entries: five bulk lines and 84 interconnection forms; retain 55 transmission work units and exclude 34 storage-side-only forms. Matching engineering narratives add no rows.',
                'scope': args.scope, 'counts': counts, 'exclusions': [{'reason': EXCLUSION_REASON, 'count': 34}], 'limitations': limitations}
    dataset = {'schemaVersion': 2, 'mode': 'real', 'title': LABEL + (' — five-record sample' if args.scope == 'sample' else ' — full accepted inventory'),
               'generatedAt': args.generated_at, 'projects': projects, 'sourceEditions': [manifest],
               'coverage': {'processed': len(projects), 'skipped': 34, 'failed': 0, 'notes': [f"All 89 primary entries reconciled; {counts['pendingRows']} retained records remain pending.", 'Work-package counts are not a statewide project census; all retained records remain unlocated.']}}
    quality = {'sourceKey': KEY, 'editionId': EDITION, 'scope': args.scope, 'originals': ORIGINALS,
               'normalizationMethod': 'Hash-pinned PDF text fields and fixed factual bulk-table cells; no original narrative publication or image interpretation.',
               'primaryScopes': {'bulkTableRows': 5, 'schedule10Forms': 84, 'supportingNarratives': 84, 'supportingNarrativesAddRows': False},
               'excludedFormNumbers': sorted(EXCLUDED), 'retainedFormNumbers': [row['number'] for row in forms if not row['excluded']],
               'acceptedRetainedKindCounts': {'transmission-project': 55}, 'acceptedRetainedUnitCounts': {'project': 1, 'component': 54},
               'acceptedRetainedLifecycleCounts': {'approved': 1, 'planned': 54}, 'acceptedPrimaryDatePrecisionCounts': {'month': 5, 'unknown': 50},
               'acceptedOwnerEvidenceCounts': {'sourceScopedFplLineOwner': 5, 'unknownInterconnectionOwner': 50},
               'importedLifecycleCounts': dict(sorted(Counter(project['inventory']['lifecycle'] for project in projects).items())),
               'sampleIds': [f'{KEY}:{source_id}' for source_id in sorted(SAMPLE_IDS)],
               'timingDiscrepancies': [{'form': row['number'], 'constructionEndYear': row['constructionEndYear'], 'projectedConnectionQuarter': row['projectedConnectionQuarter']} for row in forms if row['constructionEndYear'] != row['projectedConnectionYear']],
               'otherSourceDiscrepancies': {str(number): notes for number, notes in KNOWN_NOTES.items()},
               'unknowns': ['All centers/native geometry/CRS/accuracy', 'All actual construction starts/windows', 'Publication day and row-updated dates', '50 interconnection owners and transmission service dates', 'Statewide denominator']}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, value in [('dataset.json', dataset), ('manifest.json', manifest), ('row-ledger.json', ledger), ('source-quality.json', quality)]:
        (args.output_dir / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    sizes = {'scope': args.scope, 'datasetRecords': len(projects), 'compactUtf8Bytes': len(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')).encode()),
             'formattedUtf8Bytes': (args.output_dir / 'dataset.json').stat().st_size}
    (args.output_dir / 'payload-sizes.json').write_text(json.dumps(sizes, indent=2) + '\n')
    print(json.dumps({'sourceKey': KEY, 'counts': counts, 'payloadSizes': sizes}))


if __name__ == '__main__':
    main()
