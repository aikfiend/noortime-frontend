import { NextRequest, NextResponse } from 'next/server';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerName = (typeof PRAYER_NAMES)[number];

function filterPrayers(timings: Record<string, string>): Record<PrayerName, string> {
  return PRAYER_NAMES.reduce(
    (acc, name) => {
      acc[name] = timings[name].split(' ')[0];
      return acc;
    },
    {} as Record<PrayerName, string>,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const method = parseInt(searchParams.get('method') ?? '2', 10);
  const school = parseInt(searchParams.get('school') ?? '0', 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'lat and lng are required' }, { status: 400 });
  }

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const results = await Promise.all(
    dates.map(async (date) => {
      const [y, m, d] = date.split('-');
      const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) throw new Error(`AlAdhan error: ${res.status}`);
      const json = await res.json() as { data: { timings: Record<string, string> } };
      return { date, timings: filterPrayers(json.data.timings) };
    }),
  );

  return NextResponse.json(results);
}
