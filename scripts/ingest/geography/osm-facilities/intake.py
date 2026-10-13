"""Sequential, resumable intake of the four frozen public extracts; no latest fallback."""
from pathlib import Path
import requests
import osmium
from common import read, write, sha_file, utc, disk_guard


def verify_original(extract, path, snapshot):
    if path.stat().st_size != extract['bytes']:
        raise RuntimeError(f'Wrong original length: {path.name}')
    if sha_file(path, 'md5') != extract['md5']:
        raise RuntimeError(f'Publisher checksum mismatch: {path.name}; preserve it for diagnosis.')
    with osmium.io.Reader(osmium.io.File(str(path), 'pbf'), osmium.osm.NOTHING) as reader:
        header = reader.header()
        actual_snapshot = header.get('osmosis_replication_timestamp')
    if actual_snapshot != snapshot:
        raise RuntimeError(f'Unsynchronized PBF header: {path.name}: {actual_snapshot!r}')
    return {'url': extract['url'], 'bytes': path.stat().st_size, 'md5': extract['md5'],
            'sha256': sha_file(path), 'snapshotAsOf': actual_snapshot, 'verifiedAt': utc()}


def acquire(plan, originals, work):
    originals = Path(originals)
    originals.mkdir(parents=True, exist_ok=True)
    for index, extract in enumerate(plan['extracts']):
        name = extract['url'].rsplit('/', 1)[-1]
        final, partial = originals / name, originals / (name + '.part')
        receipt = originals / (name + '.receipt.json')
        transfer = originals / (name + '.transfer.json')
        if final.exists():
            verified = verify_original(extract, final, plan['snapshotAsOf'])
            if receipt.exists() and read(receipt)['sha256'] != verified['sha256']:
                raise RuntimeError('Previously acquired original changed; do not overwrite.')
            write(receipt, verified)
            continue
        if partial.exists() and (not transfer.exists() or read(transfer).get('extract') != extract):
            raise RuntimeError('Partial file has no matching transfer identity; preserve it and resolve explicitly.')
        offset = partial.stat().st_size if partial.exists() else 0
        if offset > extract['bytes']:
            raise RuntimeError('Partial exceeds expected original length; preserve for diagnosis.')
        remaining = sum(e['bytes'] for e in plan['extracts'][index:]) - offset
        disk_guard(plan, work, remaining)
        if offset < extract['bytes']:
            headers = {'Accept-Encoding': 'identity', 'User-Agent': 'Gridlock-reference-producer/1.0'}
            previous = read(transfer) if transfer.exists() else {}
            if offset:
                headers['Range'] = f'bytes={offset}-'
                if previous.get('etag'):
                    headers['If-Range'] = previous['etag']
            with requests.get(extract['url'], headers=headers, stream=True, timeout=(30, 90)) as response:
                response.raise_for_status()
                if offset:
                    expected = f'bytes {offset}-{extract["bytes"] - 1}/{extract["bytes"]}'
                    if response.status_code != 206 or response.headers.get('Content-Range') != expected:
                        raise RuntimeError('Server did not honor the exact resume range; partial preserved.')
                    if previous.get('etag') and response.headers.get('ETag') != previous['etag']:
                        raise RuntimeError('ETag changed while resuming; partial preserved.')
                elif response.status_code != 200:
                    raise RuntimeError('Expected a complete HTTP 200 response for a new original.')
                if response.headers.get('Content-Encoding', 'identity') != 'identity':
                    raise RuntimeError('Encoded transfer would invalidate byte offsets.')
                write(transfer, {'extract': extract, 'etag': response.headers.get('ETag'), 'startedAt': previous.get('startedAt', utc())})
                with partial.open('ab') as stream:
                    for chunk in response.iter_content(4 * 1024 * 1024):
                        if not chunk:
                            continue
                        if stream.tell() + len(chunk) > extract['bytes']:
                            raise RuntimeError('Transfer exceeds publisher length; stopped without overwriting original.')
                        disk_guard(plan, work, sum(e['bytes'] for e in plan['extracts'][index:]) - stream.tell())
                        stream.write(chunk)
        verified = verify_original(extract, partial, plan['snapshotAsOf'])
        if final.exists():
            raise RuntimeError('Original appeared concurrently; refusing replacement.')
        partial.rename(final)
        write(receipt, verified)
