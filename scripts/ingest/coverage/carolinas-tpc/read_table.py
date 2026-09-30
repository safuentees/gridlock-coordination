#!/usr/bin/env python3
"""Fill the remaining accepted CTPC table cells from its pinned public PDF text."""
import argparse
import hashlib
import json
from pathlib import Path
import re

from pypdf import PdfReader

ID = re.compile(r'^\s*(CTPC(?:DEC|DEP)\d+|MVST(?:DEC|DEP)\d+|[WEF]\d+[A-Z]?)\s+')
STATUS = re.compile(r'\b(Conceptual|Removed|Underway|In-Service|Planned|Deferred)\s+(DEC/DEP|DEC|DEP)\b\s*(.*)$')


def normalize_space(value):
    return re.sub(r'\s+', ' ', value).strip()


def read_rows(original):
    found = {}
    for number in range(8, 18):
        lines = original.pages[number - 1].extract_text(extraction_mode='layout').splitlines()
        positions = [(index, ID.match(line)) for index, line in enumerate(lines) if ID.match(line)]
        # ID, status, owner, target and cost sit on the last text line of each row.
        # The wrapped project/issue cells immediately before that line belong to it.
        issue_starts = []
        for index, _ in positions:
            prefix = lines[index][:STATUS.search(lines[index]).start()].rstrip()
            last_field = list(re.finditer(r'\S.*?(?=\s{2,}|$)', prefix))[-1]
            issue_starts.append(last_field.start())
        issue_boundary = min(issue_starts) - 1
        previous = next(index for index, line in enumerate(lines) if 'Service Date' in line) + 1
        for index, id_match in positions:
            source_id = id_match[1]
            status_match = STATUS.search(lines[index])
            name, issue = [], []
            for line_index in range(previous, index + 1):
                line = lines[line_index]
                if line.strip() in ('DEC', 'DEP', 'DEC/DEP', ''):
                    continue
                if line_index == index:
                    line = ' ' * id_match.end() + line[id_match.end():status_match.start()]
                left, right = line[:issue_boundary].strip(), line[issue_boundary:].strip()
                if left:
                    name.append(left)
                if right:
                    issue.append(right)
            tail = status_match[3].split()
            found[source_id] = {
                'project': normalize_space(' '.join(name)), 'issueResolved': normalize_space(' '.join(issue)),
                'status': status_match[1], 'transmissionOwner': status_match[2],
                'estimatedInServiceDate': tail[0] if tail else '',
                'estimatedCostMillionNominalUsd': tail[1] if len(tail) > 1 else '',
            }
            previous = index + 1
    return found


def date(raw):
    target = raw['estimatedInServiceDate']
    if not target or target == 'TBD':
        return {'value': None, 'precision': 'unknown', 'kind': 'unknown',
                'label': 'Conceptual proposal; in-service target TBD'}
    month, day, year = target.split('/')
    if (int(month), int(day)) in ((6, 1), (12, 1)):
        season = 'summer' if int(month) == 6 else 'winter'
        return {'value': year, 'precision': 'year', 'kind': 'in-service',
                'label': f'Source {season} peak-season target {target}; displayed calendar year only'}
    return {'value': f'{year}-{int(month):02d}-{int(day):02d}', 'precision': 'day', 'kind': 'in-service',
            'label': 'Reported estimated in-service date; actual service not established'}


def volts(name):
    values = []
    for match in re.finditer(r'(?<!\d)(\d+(?:/\d+)*)\s*[kK][vV]\b', name):
        for value in map(int, match[1].split('/')):
            if value not in values:
                values.append(value)
    return values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--catalog', type=Path, default=Path(__file__).with_name('catalog.json'))
    args = parser.parse_args()
    catalog = json.loads(args.catalog.read_text())
    if hashlib.sha256(args.input.read_bytes()).hexdigest() != catalog['sourceSha256']:
        raise ValueError('Changed source edition requires qualification before table extraction.')
    raw_rows = read_rows(PdfReader(args.input))
    for row in catalog['rows']:
        # Keep the six connected diagnostics byte-for-byte reproducible.
        if row['sourceId'] in catalog['sampleSourceIds']:
            continue
        raw = raw_rows[row['sourceId']]
        if raw['status'] != row['sourceStatus'] or raw['transmissionOwner'] != row['sourceTransmissionOwner']:
            raise ValueError('Source row differs from accepted status/owner mapping: ' + row['sourceId'])
        row['raw'] = raw
        if row['disposition'].startswith('exclude-'):
            continue
        conceptual = raw['status'] == 'Conceptual'
        row['proposed'] = {'id': catalog['sourceKey'] + ':' + row['sourceId'],
                          'recordKind': 'planning-context' if conceptual else 'transmission-project',
                          'lifecycle': 'unknown' if conceptual else 'planned',
                          'voltageKv': volts(raw['project']), 'date': date(raw)}
        notes = []
        if raw['status'] == 'Underway':
            notes.append('Underway includes current-year budget provision through some construction; this row alone does not establish physical construction.')
        if conceptual:
            notes.append('The source explicitly says Conceptual is not planned at this time. This is a future option, not approved construction.')
        if row['section'] == 'Multi-Value Strategic Transmission Projects' and conceptual:
            notes.append('The p.17 note excludes unapproved conceptual MVST options from approved update cost and schedule totals. A dash is an unknown estimate, not zero.')
        if raw['estimatedInServiceDate'].startswith('12/1/'):
            notes.append('December 1 is a winter peak-season placeholder. Winter crosses calendar years; the normalized year is only the displayed target year, not the end of winter or a construction interval.')
        elif raw['estimatedInServiceDate'].startswith('6/1/'):
            notes.append('June 1 is a summer peak-season placeholder; no exact service month/day or construction interval is established.')
        if row['sourceId'] == 'W200034':
            notes.append('The update p.4 change summary combines removed W230387 into this project. Keep the surviving W200034 row once; the removed ID is not a second active record.')
        if row['sourceId'] == 'MVSTDEC01':
            notes.append('The update p.2 moves removed CTPCDEC02 to MVST, but does not explicitly equate that ID with MVSTDEC01; no identity merge is inferred.')
        if row['sourceId'] == 'W230389':
            notes.append('The source retains Planned with a June 2037 peak-season target beyond the named 2025–2035 plan horizon; preserve the source target without truncating it.')
        row['notes'] = notes
    catalog['fullTableExtraction'] = 'Pinned PDF pp.8–17 text columns; row-ending native ID/status lines delimit wrapped project and issue cells. Connected sample fields remain unchanged.'
    args.catalog.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'sourceRows': len(catalog['rows']), 'tableRowsRead': len(raw_rows),
                      'sampleSourceIdsPreserved': catalog['sampleSourceIds'],
                      'retainedCatalogRows': sum(row['disposition'].startswith('retain-') for row in catalog['rows'])}))


if __name__ == '__main__':
    main()
