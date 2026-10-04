"""Native area assembly only: no repairs, hulls, fabricated centers or route inference."""
import math
from shapely.geometry import Polygon, MultiPolygon, Point, box, mapping
from shapely.affinity import translate
from shapely.validation import explain_validity


class UnsupportedGeometry(ValueError):
    pass


def unwrap(ring):
    result = [list(ring[0])]
    for lon, lat in ring[1:]:
        previous = result[-1][0]
        while lon - previous > 180:
            lon -= 360
        while lon - previous < -180:
            lon += 360
        result.append([lon, lat])
    if result[0] != result[-1] or max(p[0] for p in result) - min(p[0] for p in result) >= 180:
        raise UnsupportedGeometry('Ring winds around the globe or has an ambiguous 180-degree span.')
    return result


def assemble_polygons(outer_rings, inner_rings):
    outers = [Polygon(unwrap(ring)) for ring in outer_rings]
    if not outers or any(p.is_empty or not p.is_valid or p.area == 0 for p in outers):
        raise UnsupportedGeometry('Exterior ring is absent, degenerate or topologically invalid.')
    holes = [[] for _ in outers]
    for ring in inner_rings:
        hole = Polygon(unwrap(ring))
        if not hole.is_valid or hole.is_empty or hole.area == 0:
            raise UnsupportedGeometry('Interior ring is topologically invalid.')
        candidates = []
        for index, outer in enumerate(outers):
            # Translating by a whole turn only changes longitude representation.
            for shift in (-360, 0, 360):
                shifted = translate(hole, xoff=shift)
                if outer.contains(shifted) and not outer.boundary.intersects(shifted):
                    candidates.append((index, shifted))
        if len(candidates) != 1:
            raise UnsupportedGeometry('Hole has no unique containing exterior ring.')
        index, shifted = candidates[0]
        holes[index].append(list(shifted.exterior.coords))
    polygons = [Polygon(p.exterior.coords, holes[index]) for index, p in enumerate(outers)]
    native = polygons[0] if len(polygons) == 1 else MultiPolygon(polygons)
    if not native.is_valid:
        raise UnsupportedGeometry('Native polygon topology: ' + explain_validity(native))
    return native


def join_member_ways(ways):
    """Join by exact native endpoint IDs; branching or incomplete chains are unresolved."""
    closed, opened = [], []
    for nodes in ways:
        if len(nodes) < 2:
            raise UnsupportedGeometry('Member way has fewer than two nodes.')
        (closed if nodes[0] == nodes[-1] else opened).append(list(nodes))
    degree = {}
    for nodes in opened:
        for endpoint in (nodes[0], nodes[-1]):
            degree[endpoint] = degree.get(endpoint, 0) + 1
    if any(value != 2 for value in degree.values()):
        raise UnsupportedGeometry('Multipolygon member endpoints are missing or branch; no unique closed topology.')
    while opened:
        chain = opened.pop(0)
        while chain[0] != chain[-1]:
            candidates = [i for i, n in enumerate(opened) if chain[-1] in (n[0], n[-1])]
            if len(candidates) != 1:
                raise UnsupportedGeometry('Multipolygon ring cannot be assembled uniquely.')
            nodes = opened.pop(candidates[0])
            if nodes[-1] == chain[-1]:
                nodes.reverse()
            chain.extend(nodes[1:])
        closed.append(chain)
    return closed


def positions(store, ids):
    points = []
    for native_id in ids:
        node = store.get('node', native_id)
        if not node or node['deleted'] or node['positionE7'] is None:
            raise UnsupportedGeometry(f'Missing or invalid referenced node {native_id}.')
        lon, lat = (value / 10_000_000 for value in node['positionE7'])
        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
            raise UnsupportedGeometry(f'Referenced node {native_id} is outside EPSG:4326 ranges.')
        points.append([lon, lat])
    if len(points) < 4 or points[0] != points[-1] or len(set(map(tuple, points[:-1]))) < 3:
        raise UnsupportedGeometry('Native ring is not closed with at least three distinct vertices.')
    return points


def build_geometry(store, obj):
    base = {'crs': 'EPSG:4326', 'accuracyMeters': None}
    if obj['deleted']:
        raise UnsupportedGeometry('Deleted native element has no current geometry.')
    if obj['type'] == 'node':
        if obj['positionE7'] is None:
            raise UnsupportedGeometry('Native node has no valid position.')
        point = [n / 10_000_000 for n in obj['positionE7']]
        if not (-180 <= point[0] <= 180 and -90 <= point[1] <= 90):
            raise UnsupportedGeometry('Native node is outside EPSG:4326 ranges.')
        return {**base, 'kind': 'node', 'position': point, 'meaning': 'community-facility-position'}, Point(point)
    if obj['tags'].get('area') == 'no':
        raise UnsupportedGeometry('Native area=no contradicts a facility footprint interpretation.')
    outer_ids, inner_ids = [], []
    if obj['type'] == 'way':
        outer_ids = [obj['nodes']]
    else:
        if obj['tags'].get('type') != 'multipolygon':
            raise UnsupportedGeometry('Relation is not explicitly type=multipolygon; no area or center inferred.')
        groups = {'outer': [], 'inner': []}
        for member in obj['members']:
            if member['type'] != 'way' or member['role'] not in groups:
                raise UnsupportedGeometry('Multipolygon member is nested/non-way or lacks an explicit outer/inner role.')
            way = store.get('way', member['id'])
            if way is None or way['deleted']:
                raise UnsupportedGeometry(f'Missing member way {member["id"]}.')
            groups[member['role']].append(way['nodes'])
        outer_ids = join_member_ways(groups['outer'])
        inner_ids = join_member_ways(groups['inner'])
    native = assemble_polygons([positions(store, ids) for ids in outer_ids], [positions(store, ids) for ids in inner_ids])
    polygons = [native] if native.geom_type == 'Polygon' else list(native.geoms)
    crossing = any(p.bounds[0] < -180 or p.bounds[2] > 180 for p in polygons)
    if not crossing:
        return {**base, 'kind': 'footprint', 'meaning': 'community-mapped-footprint', 'geometry': mapping(native)}, native
    # Cut supported native geometry into world bands, never a single globe-spanning extent.
    parts = []
    for polygon in polygons:
        first = math.floor((polygon.bounds[0] + 180) / 360)
        last = math.floor((polygon.bounds[2] + 180) / 360)
        for band in range(first, last + 1):
            cut = polygon.intersection(box(-180 + 360 * band, -90, 180 + 360 * band, 90))
            if cut.is_empty:
                continue
            candidates = [cut] if cut.geom_type == 'Polygon' else list(getattr(cut, 'geoms', []))
            for piece in candidates:
                if piece.geom_type == 'Polygon' and piece.area > 0:
                    parts.append(translate(piece, xoff=-360 * band))
    if not parts:
        raise UnsupportedGeometry('Antimeridian decomposition yielded no supported area.')
    actual = parts[0] if len(parts) == 1 else MultiPolygon(parts)
    if not actual.is_valid:
        raise UnsupportedGeometry('Antimeridian decomposition is invalid: ' + explain_validity(actual))
    return {**base, 'kind': 'extent', 'meaning': 'facility-bounding-extent',
            'parts': [list(p.bounds) for p in parts], 'derivedFrom': native.geom_type,
            'derivation': 'Separate bounds of native supported polygon components after antimeridian clipping; holes retained for context, no center.'}, actual
