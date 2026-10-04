#!/usr/bin/env python3
"""Full-scope facility producer. Bulk operations require coordinator resource confirmation."""
import argparse
from pathlib import Path
import sys
import os
import fcntl
from common import HERE, approval, digest, disk_guard, read, supervised, write


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['plan', 'acquire', 'enumerate', 'build'])
    parser.add_argument('--plan', type=Path, default=HERE / 'plan.json')
    parser.add_argument('--originals', type=Path, required=True)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--approval', type=Path)
    parser.add_argument('--extract', choices=['us', 'puerto-rico', 'us-virgin-islands', 'american-oceania'])
    parser.add_argument('--census-originals', type=Path)
    parser.add_argument('--schema-root', type=Path)
    parser.add_argument('--node', type=Path)
    parser.add_argument('--tsx', type=Path)
    parser.add_argument('--limit', type=int, help='Only an initial processing batch; all known raw identities remain in the ledger. Omit to complete every identity.')
    parser.add_argument('--internal-stage', action='store_true', help=argparse.SUPPRESS)
    args = parser.parse_args()
    plan = read(args.plan)
    if args.command == 'plan':
        print(__import__('json').dumps({'planSha256': digest(plan), 'publishedOriginalBytes': sum(e['bytes'] for e in plan['extracts']),
              'resourceLimits': plan['resources'], 'censusOriginalBytes': sum(f['bytes'] for f in plan['census']['files']),
              'approvalTemplate': {'approvedBy': 'coordinator', 'approvedAt': None, 'planSha256': digest(plan),
                                   'originalsDir': str(args.originals.resolve()), 'workDir': str(args.work.resolve())},
              'status': 'Requires concrete coordinator resource confirmation; no bulk work performed.'}, indent=2))
        return
    if args.approval is None:
        parser.error('--approval is required for acquisition/processing')
    approval(plan, args.approval, args.originals, args.work)
    args.work.mkdir(parents=True, exist_ok=True)
    identity_path = args.work / 'producer-work.json'
    identity = {'producer': 'F28-B3', 'planSha256': digest(plan), 'originalsDir': str(args.originals.resolve())}
    if identity_path.exists():
        if read(identity_path) != identity:
            raise RuntimeError('Work directory belongs to another plan; preserve it and select a new authorized directory.')
    elif any(args.work.iterdir()):
        raise RuntimeError('Nonempty work directory lacks this producer identity; no files were removed.')
    else:
        write(identity_path, identity)
    disk_guard(plan, args.work)
    if not args.internal_stage:
        with (args.work / 'producer.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            supervised([sys.executable, str(Path(__file__).resolve()), *sys.argv[1:], '--internal-stage'], plan, args.work)
        return
    if os.environ.get('F28_SUPERVISED_CHILD') != '1':
        raise RuntimeError('Internal stages must run under the resource supervisor.')
    if args.command == 'acquire':
        from intake import acquire
        acquire(plan, args.originals, args.work)
    elif args.command == 'enumerate':
        from enumerate import enumerate_extract
        for extract in plan['extracts']:
            if args.extract is None or args.extract == extract['id']:
                enumerate_extract(plan, extract, args.originals, args.work)
    else:
        if not all((args.census_originals, args.schema_root, args.node, args.tsx)):
            parser.error('build requires --census-originals, --schema-root, --node and --tsx from existing approved runtimes')
        if args.limit is not None and args.limit < 1:
            parser.error('--limit must be positive; omit to complete the full inventory')
        from build import build
        build(plan, args.originals, args.census_originals, args.work, args.schema_root, args.node, args.tsx, args.limit)


if __name__ == '__main__':
    main()
