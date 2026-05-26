import type { DayCompletion } from '@/types';

interface Props {
  data: DayCompletion[];
  weeks?: number;
}

function getIntensity(completion: DayCompletion): number {
  const count = Object.values(completion.prayers).filter(Boolean).length;
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 4) return 3;
  return 4;
}

const INTENSITY_CLASSES = [
  'bg-navy-700',
  'bg-emerald-900',
  'bg-emerald-800',
  'bg-emerald-600',
  'bg-emerald-500',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function StreakHeatmap({ data, weeks = 52 }: Props) {
  const completionByDate = new Map(data.map((d) => [d.date, d]));

  // Build grid: last `weeks` weeks worth of days, aligned to week start (Sunday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gridEnd = new Date(today);
  const dayOfWeek = today.getDay();
  gridEnd.setDate(today.getDate() - dayOfWeek + 6); // end of this week (Saturday)

  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - weeks * 7 + 1);

  const cells: Array<{ date: string; completion: DayCompletion | null; isToday: boolean }> = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const dateStr = cursor.toISOString().split('T')[0];
    cells.push({
      date: dateStr,
      completion: completionByDate.get(dateStr) ?? null,
      isToday: dateStr === today.toISOString().split('T')[0],
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Chunk into weeks (columns)
  const columns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-3" /> {/* spacer for month labels */}
          {DAY_LABELS.map((d, i) => (
            <div key={d} className={`h-3 text-[10px] text-slate-500 flex items-center ${i % 2 === 0 ? 'opacity-0' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {columns.map((week, wi) => {
          const monthLabel = wi === 0 || new Date(week[0].date).getDate() <= 7
            ? new Date(week[0].date).toLocaleString('default', { month: 'short' })
            : '';

          return (
            <div key={wi} className="flex flex-col gap-1">
              <div className="h-3 text-[10px] text-slate-500">{monthLabel}</div>
              {week.map((cell) => {
                const intensity = cell.completion ? getIntensity(cell.completion) : 0;
                const prayers = cell.completion
                  ? Object.entries(cell.completion.prayers)
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join(', ') || 'None'
                  : 'No data';

                return (
                  <div
                    key={cell.date}
                    title={`${cell.date} — ${prayers}`}
                    className={`w-3 h-3 rounded-sm transition-colors ${INTENSITY_CLASSES[intensity]}
                      ${cell.isToday ? 'ring-1 ring-gold-400' : ''}
                    `}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
