export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getHeatmap } from '@/lib/streaks';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const days = parseInt(request.nextUrl.searchParams.get('days') ?? '365', 10);
  const heatmap = await getHeatmap(session.user.id, isNaN(days) ? 365 : days);
  return NextResponse.json(heatmap);
}
