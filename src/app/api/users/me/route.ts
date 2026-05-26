export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, location, preferences] = await Promise.all([
    db.queryOne(
      'SELECT id, google_id, email, name, avatar_url, created_at, updated_at FROM users WHERE id = ?',
      [userId],
    ),
    db.queryOne('SELECT * FROM user_locations WHERE user_id = ?', [userId]),
    db.queryOne('SELECT * FROM user_preferences WHERE user_id = ?', [userId]),
  ]);

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user, location, preferences });
}
