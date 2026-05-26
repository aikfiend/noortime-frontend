import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeekPrayers, useMonthPrayers } from '@/hooks/usePrayerTimes';
import { usersApi } from '@/api/client';
import type { UserProfile } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type View = 'week' | 'month';

const PRAYER_COLS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function formatTime(t: string, fmt: '12h' | '24h') {
  if (fmt === '24h') return t;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function Schedule() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('week');
  const geo = useGeolocation(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['users', 'me'],
    queryFn: async () => (await usersApi.profile()).data as UserProfile,
    enabled: !!user,
  });

  const coords = geo.coords ?? (
    profile?.location
      ? { latitude: Number(profile.location.latitude), longitude: Number(profile.location.longitude) }
      : null
  );

  const fmt = profile?.preferences?.time_format ?? '24h';

  const weekQuery = useWeekPrayers(view === 'week' ? coords : null);
  const monthQuery = useMonthPrayers(view === 'month' ? coords : null, year, month);

  const data = view === 'week' ? weekQuery.data : monthQuery.data;
  const isLoading = view === 'week' ? weekQuery.isLoading : monthQuery.isLoading;

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-white">Schedule</h1>
        <div className="flex rounded-xl overflow-hidden border border-navy-700">
          {(['week', 'month'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm capitalize transition-colors
                ${view === v ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="btn-ghost">‹</button>
          <span className="text-slate-300 font-medium w-36 text-center">{monthName} {year}</span>
          <button onClick={nextMonth} className="btn-ghost">›</button>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left py-3 px-4 text-slate-500 font-medium">Date</th>
              {PRAYER_COLS.map((p) => (
                <th key={p} className="py-3 px-3 text-slate-500 font-medium text-center">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: view === 'week' ? 7 : 30 }, (_, i) => (
                <tr key={i} className="border-b border-navy-800">
                  <td className="py-3 px-4"><div className="h-4 w-24 bg-navy-700 rounded animate-pulse" /></td>
                  {PRAYER_COLS.map((p) => (
                    <td key={p} className="py-3 px-3 text-center">
                      <div className="h-4 w-12 bg-navy-700 rounded animate-pulse mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.map((day) => {
              const isToday = day.date === today.toISOString().split('T')[0];
              return (
                <tr
                  key={day.date}
                  className={`border-b border-navy-800 transition-colors hover:bg-navy-800/50
                    ${isToday ? 'bg-emerald-900/20' : ''}`}
                >
                  <td className="py-3 px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                    {isToday && <span className="ml-2 badge bg-emerald-900 text-emerald-400">Today</span>}
                  </td>
                  {PRAYER_COLS.map((p) => (
                    <td key={p} className="py-3 px-3 text-center font-mono text-slate-300 text-xs">
                      {formatTime(day.timings[p], fmt)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
