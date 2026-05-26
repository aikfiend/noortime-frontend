import { NextRequest, NextResponse } from 'next/server';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerName = (typeof PRAYER_NAMES)[number];

function filterPrayers(timings: Record<string, string>): Record<PrayerName, string> {
  return PRAYER_NAMES.reduce(
    (acc, name) => {
      acc[name] = timings[name].split(' ')[0]; // strip timezone suffix
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

  const today = new Date().toISOString().split('T')[0];
  const [y, m, d] = today.split('-');
  const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ message: 'Failed to fetch prayer times' }, { status: 502 });
  }

  const json = await res.json() as { data: { timings: Record<string, string> } };
  return NextResponse.json({ date: today, timings: filterPrayers(json.data.timings) });
}
