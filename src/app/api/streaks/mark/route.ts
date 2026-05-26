export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { markPrayer, unmarkPrayer, TRACKABLE_PRAYERS, type TrackablePrayer } from '@/lib/streaks';

interface MarkBody {
  date: string;
  prayer: string;
}

function isTrackable(prayer: string): prayer is TrackablePrayer {
  return (TRACKABLE_PRAYERS as readonly string[]).includes(prayer);
}

function isDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as MarkBody;
  if (!isDateString(body.date) || !isTrackable(body.prayer)) {
    return NextResponse.json({ message: 'Valid date (YYYY-MM-DD) and prayer name required' }, { status: 400 });
  }

  const mark = await markPrayer(session.user.id, body.date, body.prayer);
  return NextResponse.json(mark);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as MarkBody;
  if (!isDateString(body.date) || !isTrackable(body.prayer)) {
    return NextResponse.json({ message: 'Valid date (YYYY-MM-DD) and prayer name required' }, { status: 400 });
  }

  await unmarkPrayer(session.user.id, body.date, body.prayer);
  return NextResponse.json({ ok: true });
}
