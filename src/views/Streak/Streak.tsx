import { useQuery } from '@tanstack/react-query';
import { streaksApi } from '@/api/client';
import { StreakHeatmap } from '@/components/StreakHeatmap/StreakHeatmap';
import type { StreakStats, DayCompletion } from '@/types';

export function Streak() {
  const { data: stats, isLoading: statsLoading } = useQuery<StreakStats>({
    queryKey: ['streaks', 'stats'],
    queryFn: async () => (await streaksApi.stats()).data as StreakStats,
  });

  const { data: heatmap, isLoading: heatmapLoading } = useQuery<DayCompletion[]>({
    queryKey: ['streaks', 'heatmap'],
    queryFn: async () => (await streaksApi.heatmap(365)).data as DayCompletion[],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Prayer Streak</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Current Streak"
          value={statsLoading ? '—' : String(stats?.currentStreak ?? 0)}
          unit="days"
          icon="🔥"
          highlight={!!stats?.currentStreak}
        />
        <StatCard
          label="Best Streak"
          value={statsLoading ? '—' : String(stats?.bestStreak ?? 0)}
          unit="days"
          icon="🏆"
        />
      </div>

      {/* Heatmap */}
      <div className="card">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">
          Last 52 weeks
        </h2>
        {heatmapLoading ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            Loading heatmap…
          </div>
        ) : (
          <StreakHeatmap data={heatmap ?? []} weeks={52} />
        )}
      </div>

      {/* Info */}
      <div className="card bg-navy-900 border-navy-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">How streaks work</h3>
        <p className="text-sm text-slate-500">
          A day counts as complete when you mark all 5 prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).
          Mark prayers on the Dashboard as you complete them. Your streak resets if you miss a full day.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label, value, unit, icon, highlight,
}: {
  label: string; value: string; unit: string; icon: string; highlight?: boolean;
}) {
  return (
    <div className={`card flex flex-col items-center text-center gap-1 py-8
      ${highlight ? 'border-gold-500/40 bg-gold-500/5' : ''}`}>
      <span className="text-3xl">{icon}</span>
      <p className={`text-4xl font-bold mt-1 ${highlight ? 'text-gold-400' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500 uppercase tracking-widest">{unit}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );
}
