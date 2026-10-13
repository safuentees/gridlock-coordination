"""Producer-only persistence, resource limits and immutable input identities."""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import signal
import time
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
TYPES = {'n': 'node', 'w': 'way', 'r': 'relation'}
TAGS = ('power', 'name', 'alt_name', 'official_name', 'ref', 'operator', 'voltage',
        'substation', 'disused', 'abandoned', 'construction')


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.writing')
    with temp.open('wb') as stream:
        stream.write(canonical(value))
        stream.flush()
        os.fsync(stream.fileno())
    temp.replace(path)


def sha_file(path, algorithm='sha256'):
    result = hashlib.new(algorithm)
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(8 * 1024 * 1024), b''):
            result.update(chunk)
    return result.hexdigest()


def utc():
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')


def tree_bytes(path):
    total = 0
    for item in Path(path).rglob('*'):
        try:
            if item.is_file():
                total += item.stat().st_size
        except FileNotFoundError:
            # Native writers/SQLite remove their own temporary files concurrently.
            continue
    return total


def citation(extract):
    return {'file': extract['url'].rsplit('/', 1)[-1],
            'locator': 'Complete native node/way/relation inventory tagged power=substation', 'url': extract['url']}


def approval(plan, path, originals, work):
    value = read(path)
    if value.get('planSha256') != digest(plan) or value.get('approvedBy') != 'coordinator' or not value.get('approvedAt'):
        raise RuntimeError('A coordinator resource confirmation for this exact plan is required.')
    for key, actual in [('originalsDir', originals), ('workDir', work)]:
        if Path(value.get(key, '')).resolve() != Path(actual).resolve():
            raise RuntimeError(f'Resource confirmation must identify the exact {key}.')
    if (Path(originals).resolve() == Path(work).resolve() or Path(originals).resolve() in Path(work).resolve().parents
            or Path(work).resolve() in Path(originals).resolve().parents):
        raise RuntimeError('Keep originals and disposable producer work in separate directories.')
    return value


def disk_guard(plan, work, remaining_inputs=0):
    limits = plan['resources']
    used = tree_bytes(work)
    if used > limits['maxScratchBytes']:
        raise RuntimeError('Scratch cap reached; retain the checkpoint and request a revised resource plan.')
    needed = limits['minFreeBytes'] + remaining_inputs + max(0, limits['maxScratchBytes'] - used)
    if shutil.disk_usage(work).free < needed:
        raise RuntimeError(f'Insufficient space: need {needed} free bytes including remaining inputs, scratch and reserve.')


def supervised(command, plan, work):
    """Monitor native-library temporary files and resident memory, including writer close."""
    env = dict(os.environ, TMPDIR=str(Path(work).resolve()), PYTHONDONTWRITEBYTECODE='1', F28_SUPERVISED_CHILD='1')
    child = subprocess.Popen(command, env=env, start_new_session=True)
    try:
        while child.poll() is None:
            if tree_bytes(work) > plan['resources']['maxScratchBytes']:
                raise RuntimeError('Scratch cap reached during producer stage; stage remains pending.')
            if shutil.disk_usage(work).free < plan['resources']['minFreeBytes']:
                raise RuntimeError('Free-space reserve reached during producer stage; stage remains pending.')
            result = subprocess.run(['ps', '-axo', 'pid=,ppid=,rss='], capture_output=True, text=True, check=True)
            processes = [tuple(map(int, line.split())) for line in result.stdout.splitlines() if line.strip()]
            descendants = {child.pid}
            while True:
                expanded = descendants | {pid for pid, parent, _ in processes if parent in descendants}
                if expanded == descendants:
                    break
                descendants = expanded
            rss = sum(kib * 1024 for pid, _, kib in processes if pid in descendants)
            if rss > plan['resources']['maxRssBytes']:
                raise RuntimeError('Producer resident-memory cap reached; stage remains pending.')
            time.sleep(1)
        if child.returncode:
            raise RuntimeError(f'Producer stage exited {child.returncode}; no completion marker was accepted.')
    except BaseException:
        if child.poll() is None:
            os.killpg(child.pid, signal.SIGTERM)
            try:
                child.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(child.pid, signal.SIGKILL)
                child.wait()
        raise
