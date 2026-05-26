import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'lat and lng are required' }, { status: 400 });
  }

  const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`, {
    next: { revalidate: 86400 }, // Qibla direction is static — cache 24h
  });

  if (!res.ok) {
    return NextResponse.json({ message: 'Failed to fetch Qibla direction' }, { status: 502 });
  }

  const json = await res.json() as { data: { latitude: number; longitude: number; direction: number } };
  return NextResponse.json(json.data);
}
