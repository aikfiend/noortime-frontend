export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

interface LocationBody {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string | null;
  country?: string | null;
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = (await request.json()) as LocationBody;
  const { latitude, longitude, timezone, city = null, country = null } = body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number' || !timezone) {
    return NextResponse.json({ message: 'latitude, longitude and timezone are required' }, { status: 400 });
  }

  await db.execute(
    `INSERT INTO user_locations (user_id, city, country, latitude, longitude, timezone)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       city      = VALUES(city),
       country   = VALUES(country),
       latitude  = VALUES(latitude),
       longitude = VALUES(longitude),
       timezone  = VALUES(timezone)`,
    [userId, city, country, latitude, longitude, timezone],
  );

  const location = await db.queryOne(
    'SELECT * FROM user_locations WHERE user_id = ?',
    [userId],
  );

  return NextResponse.json(location);
}
