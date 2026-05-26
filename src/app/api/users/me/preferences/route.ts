export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

interface PreferencesBody {
  calculation_method?: number;
  madhab?: number;
  time_format?: '12h' | '24h';
}

interface StoredPreferences {
  user_id: number;
  calculation_method: number;
  madhab: number;
  time_format: '12h' | '24h';
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = (await request.json()) as PreferencesBody;

  const existing = await db.queryOne<StoredPreferences>(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [userId],
  );

  const merged = {
    calculation_method: body.calculation_method ?? existing?.calculation_method ?? 2,
    madhab: body.madhab ?? existing?.madhab ?? 0,
    time_format: body.time_format ?? existing?.time_format ?? '24h',
  };

  await db.execute(
    `INSERT INTO user_preferences (user_id, calculation_method, madhab, time_format)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       calculation_method = VALUES(calculation_method),
       madhab             = VALUES(madhab),
       time_format        = VALUES(time_format)`,
    [userId, merged.calculation_method, merged.madhab, merged.time_format],
  );

  const preferences = await db.queryOne(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [userId],
  );

  return NextResponse.json(preferences);
}
