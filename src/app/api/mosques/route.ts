import { NextRequest, NextResponse } from 'next/server';

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:en'?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    'addr:housenumber'?: string;
  };
};

const OVERPASS_MIRRORS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { ts: number; data: Mosque[] }>();

function cacheKey(lat: number, lng: number, radiusM: number) {
  return `${lat.toFixed(2)},${lng.toFixed(2)},${radiusM}`;
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const radius = parseInt(searchParams.get('radius') ?? '5000', 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'lat and lng are required' }, { status: 400 });
  }

  const key = cacheKey(lat, lng, radius);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  let elements: OverpassElement[] | null = null;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'NoorTime/1.0 (https://noortime.fiend.services)',
        },
        body: query,
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const json = await res.json() as { elements: OverpassElement[] };
      elements = json.elements;
      break;
    } catch {
      // try next mirror
    }
  }

  if (!elements) {
    return NextResponse.json({ message: 'All Overpass mirrors failed' }, { status: 502 });
  }

  const mosques = elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return null;
      const tags = el.tags ?? {};
      const name = tags['name:en'] ?? tags.name ?? 'Mosque';
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
      ].filter(Boolean);
      return {
        id: String(el.id),
        name,
        address: addressParts.length ? addressParts.join(', ') : 'Address not available',
        lat: elLat,
        lng: elLng,
        distance: Math.round(haversineM(lat, lng, elLat, elLng)),
      } satisfies Mosque;
    })
    .filter((m): m is Mosque => m !== null)
    .sort((a, b) => a.distance - b.distance);

  cache.set(key, { ts: Date.now(), data: mosques });
  return NextResponse.json(mosques);
}
