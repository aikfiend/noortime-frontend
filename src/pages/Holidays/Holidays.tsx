import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { holidaysApi } from '@/api/client';
import type { IslamicHoliday } from '@/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_STYLES: Record<IslamicHoliday['type'], string> = {
  eid: 'bg-gold-500/20 text-gold-300 border-gold-500/30',
  ramadan: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  observance: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const TYPE_DOT: Record<IslamicHoliday['type'], string> = {
  eid: 'bg-gold-400',
  ramadan: 'bg-emerald-400',
  observance: 'bg-blue-400',
};

const TYPE_LABELS: Record<IslamicHoliday['type'], string> = {
  eid: 'Eid',
  ramadan: 'Ramadan',
  observance: 'Observance',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function MonthCalendar({
  year,
  month,
  holidays,
}: {
  year: number;
  month: number;
  holidays: IslamicHoliday[];
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const holidayMap = new Map<number, IslamicHoliday>();
  for (const h of holidays) {
    const [hy, hm, hd] = h.date.split('-').map(Number);
    if (hy === year && hm - 1 === month) holidayMap.set(hd, h);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const holiday = holidayMap.get(day);
          const isToday = iso === todayStr;
          return (
            <div
              key={i}
              title={holiday?.name}
              className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-sm
                ${isToday ? 'ring-1 ring-emerald-500/50 bg-emerald-900/20' : ''}
                ${holiday ? 'font-semibold' : 'text-slate-400'}
              `}
            >
              <span className={holiday ? 'text-white' : ''}>{day}</span>
              {holiday && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${TYPE_DOT[holiday.type]}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Holidays() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { data: holidays = [], isLoading, error } = useQuery<IslamicHoliday[]>({
    queryKey: ['holidays', year],
    queryFn: async () => (await holidaysApi.year(year)).data as IslamicHoliday[],
    staleTime: 24 * 60 * 60 * 1000,
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthHolidays = holidays.filter(h => {
    const [hy, hm] = h.date.split('-').map(Number);
    return hy === year && hm - 1 === month;
  });

  const upcoming = holidays.filter(h => h.date >= today.toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Islamic Holidays</h1>
          <p className="text-slate-500 text-xs mt-1">Hijri calendar events for {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)} className="btn-ghost text-sm px-2">◀</button>
          <span className="text-white font-medium w-12 text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="btn-ghost text-sm px-2">▶</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        {(['eid', 'ramadan', 'observance'] as const).map(type => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${TYPE_DOT[type]}`} />
            {TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="btn-ghost text-sm px-2">◀</button>
          <span className="text-white font-medium">{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} className="btn-ghost text-sm px-2">▶</button>
        </div>

        {isLoading ? (
          <div className="h-48 animate-pulse bg-navy-700/40 rounded-lg" />
        ) : (
          <MonthCalendar year={year} month={month} holidays={holidays} />
        )}

        {monthHolidays.length > 0 && (
          <div className="border-t border-navy-700 pt-4 space-y-2">
            {monthHolidays.map(h => (
              <div key={h.date} className="flex items-start gap-3">
                <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${TYPE_DOT[h.type]}`} />
                <div>
                  <p className="text-sm font-medium text-white">{h.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(h.date)} · {h.hijriDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All holidays for the year */}
      {error && (
        <div className="card border-red-500/30 text-red-400 text-sm">
          Failed to load holidays. Please try again later.
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            {upcoming.length > 0 ? 'Upcoming' : 'All'} · {year}
          </h2>
          {(upcoming.length > 0 ? upcoming : holidays).map(h => (
            <div key={h.date} className={`card border ${TYPE_STYLES[h.type]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{h.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[h.type]}`}>
                      {TYPE_LABELS[h.type]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{h.hijriDate}</p>
                  <p className="text-sm text-slate-400 mt-1">{h.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-white whitespace-nowrap">
                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
