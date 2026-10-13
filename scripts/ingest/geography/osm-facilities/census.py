"""Hash-pinned full Census state/territory polygons; no bbox-based identity assignment."""
from pathlib import Path
from shapely.geometry import LinearRing, Polygon, MultiPolygon, mapping
from shapely.validation import explain_validity
from common import read, write, sha_file

CROSSWALK = dict(pair.split(':') for pair in (
    '01:AL 02:AK 04:AZ 05:AR 06:CA 08:CO 09:CT 10:DE 11:DC 12:FL 13:GA '
    '15:HI 16:ID 17:IL 18:IN 19:IA 20:KS 21:KY 22:LA 23:ME 24:MD 25:MA '
    '26:MI 27:MN 28:MS 29:MO 30:MT 31:NE 32:NV 33:NH 34:NJ 35:NM 36:NY '
    '37:NC 38:ND 39:OH 40:OK 41:OR 42:PA 44:RI 45:SC 46:SD 47:TN 48:TX '
    '49:UT 50:VT 51:VA 53:WA 54:WV 55:WI 56:WY 60:AS 66:GU 69:MP 72:PR 78:VI'
).split())


def esri_polygon(rings):
    outers, interiors = [], []
    for ring in rings:
        if len(ring) < 4 or ring[0] != ring[-1] or any(not (-180 <= p[0] <= 180 and -90 <= p[1] <= 90) for p in ring):
            raise RuntimeError('Census ring is not a closed EPSG:4326 ring; no repair applied.')
        poly = Polygon(ring)
        if not poly.is_valid or poly.area == 0:
            raise RuntimeError('Census ring topology is invalid: ' + explain_validity(poly))
        # Esri JSON specifies clockwise exteriors and counterclockwise interiors.
        (interiors if LinearRing(ring).is_ccw else outers).append(poly)
    holes = [[] for _ in outers]
    for interior in interiors:
        owners = [i for i, outer in enumerate(outers) if outer.contains(interior)]
        if len(owners) != 1:
            raise RuntimeError('Census hole has no unique outer ring; context cannot be claimed complete.')
        holes[owners[0]].append(list(interior.exterior.coords))
    if not outers:
        raise RuntimeError('Census feature lacks an exterior ring.')
    polys = [Polygon(outer.exterior.coords, holes[i]) for i, outer in enumerate(outers)]
    geometry = polys[0] if len(polys) == 1 else MultiPolygon(polys)
    if not geometry.is_valid:
        raise RuntimeError('Census polygon topology is invalid: ' + explain_validity(geometry))
    return geometry


class CensusContext:
    def __init__(self, plan, originals, work):
        self.areas, features = [], []
        seen = set()
        for source in plan['census']['files']:
            path = Path(originals) / source['file']
            if path.stat().st_size != source['bytes'] or sha_file(path) != source['sha256']:
                raise RuntimeError('Census original hash/bytes mismatch: ' + source['file'])
            page = read(path)
            # Pagination may set exceededTransferLimit; exact 56 unique identities close the inventory.
            if page.get('spatialReference', {}).get('wkid') != 4326:
                raise RuntimeError('Census page must explicitly declare EPSG:4326.')
            for feature in page['features']:
                attrs = feature['attributes']
                geoid, code = attrs['GEOID'], attrs['STUSAB']
                if geoid in seen or CROSSWALK.get(geoid) != code or attrs['STATE'] != geoid:
                    raise RuntimeError('Census identity is duplicated or disagrees with the accepted GEOID/postal crosswalk.')
                seen.add(geoid)
                geometry = esri_polygon(feature['geometry']['rings'])
                self.areas.append((geoid, code, geometry))
                features.append({'type': 'Feature', 'properties': {'geoid': geoid, 'stateCode': code}, 'geometry': mapping(geometry)})
        if seen != set(CROSSWALK) or len(features) != plan['census']['count']:
            raise RuntimeError('All 56 complete Census areas are required before assigning context.')
        path = Path(work) / 'census-full-state-polygons.json'
        write(path, {'type': 'FeatureCollection', 'editionId': plan['census']['editionId'],
                     'crsMeaning': 'EPSG:4326 longitude/latitude, server-projected full Census polygons',
                     'sources': plan['census']['files'], 'features': features})
        self.boundary = {'authority': 'US Census Bureau', 'editionId': plan['census']['editionId'],
                         'sha256': sha_file(path), 'geometry': 'full-polygon', 'crs': 'EPSG:4326',
                         'evidence': [{'file': path.name, 'locator': 'All 56 full state/territory polygons; exact source pages and hashes retained in this boundary artifact.',
                                       'url': 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/80'}]}

    def evaluate(self, geometry, node):
        matches = []
        for geoid, code, area in self.areas:
            if area.contains(geometry) and not area.boundary.intersects(geometry):
                relation = 'contained'
            elif area.touches(geometry):
                relation = 'boundary-touch'
            elif area.intersects(geometry):
                relation = 'intersects'
            else:
                continue
            matches.append({'geoid': geoid, 'stateCode': code, 'relationship': relation})
        if len(matches) == 1 and matches[0]['relationship'] == 'contained':
            status, reason = 'contained', 'Native geometry lies strictly inside one full Census area without boundary contact.'
        elif len(matches) >= 2 and all(m['relationship'] != 'contained' for m in matches):
            status, reason = 'cross-boundary', 'Native geometry intersects or touches multiple Census areas; no unique state is asserted.'
        elif matches:
            status, reason = 'ambiguous', 'Boundary contact, partial coverage or conflicting containing areas prevent unique context.'
        else:
            status, reason = 'outside-supported', 'Valid native geometry does not intersect the 56 supported Census areas.'
        return {'boundary': self.boundary, 'method': 'point-in-polygon' if node else 'geometry-intersection',
                'evaluatedGeometry': 'native-node' if node else 'native-footprint', 'status': status,
                'matches': matches, 'reason': reason}
