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

interface AlAdhanDay {
  timings: Record<string, string>;
  date: { gregorian: { day: string } };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const method = parseInt(searchParams.get('method') ?? '2', 10);
  const school = parseInt(searchParams.get('school') ?? '0', 10);
  const year = parseInt(searchParams.get('year') ?? '', 10);
  const month = parseInt(searchParams.get('month') ?? '', 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'lat and lng are required' }, { status: 400 });
  }
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ message: 'Valid year and month are required' }, { status: 400 });
  }

  const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ message: 'Failed to fetch prayer times' }, { status: 502 });
  }

  const json = await res.json() as { data: AlAdhanDay[] };
  const results = json.data.map((day) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(day.date.gregorian.day).padStart(2, '0')}`,
    timings: filterPrayers(day.timings),
  }));

  return NextResponse.json(results);
}
