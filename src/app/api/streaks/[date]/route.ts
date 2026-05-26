export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDayCompletion } from '@/lib/streaks';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: 'Invalid date format (expected YYYY-MM-DD)' }, { status: 400 });
  }

  const completion = await getDayCompletion(session.user.id, date);
  return NextResponse.json(completion);
}
