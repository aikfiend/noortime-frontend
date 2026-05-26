import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTodayPrayers, computePrayerStatus } from '@/hooks/usePrayerTimes';
import { Countdown } from '@/components/Countdown/Countdown';
import { PrayerCard } from '@/components/PrayerCard/PrayerCard';
import { streaksApi, usersApi } from '@/api/client';
import type { DayCompletion, PrayerName, TrackablePrayer, UserProfile } from '@/types';

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const TODAY = new Date().toISOString().split('T')[0];

export function Dashboard() {
  const { user } = useAuth();
  const geo = useGeolocation(true);
  const qc = useQueryClient();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['users', 'me'],
    queryFn: async () => (await usersApi.profile()).data as UserProfile,
    enabled: !!user,
  });

  // Resolve coords: geo first, then saved location
  const coords = geo.coords ?? (
    profile?.location
      ? { latitude: Number(profile.location.latitude), longitude: Number(profile.location.longitude) }
      : null
  );

  const { data: todayData, isLoading, error } = useTodayPrayers(coords);

  const { data: dayCompletion } = useQuery<DayCompletion>({
    queryKey: ['streaks', 'day', TODAY],
    queryFn: async () => (await streaksApi.day(TODAY)).data as DayCompletion,
    enabled: !!user,
  });

  const markMutation = useMutation({
    mutationFn: ({ prayer, completed }: { prayer: TrackablePrayer; completed: boolean }) =>
      completed ? streaksApi.mark(TODAY, prayer) : streaksApi.unmark(TODAY, prayer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });

  // Save geo coords to user profile (once)
  const [savedGeo, setSavedGeo] = useState(false);
  if (user && geo.coords && profile && !profile.location && !savedGeo) {
    setSavedGeo(true);
    usersApi.updateLocation({
      latitude: geo.coords.latitude,
      longitude: geo.coords.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then(() => qc.invalidateQueries({ queryKey: ['users', 'me'] }));
  }

  const timeFormat = profile?.preferences?.time_format ?? '24h';

  const status = todayData ? computePrayerStatus(todayData.timings) : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return 'Assalamu Alaikum';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Location notice */}
      {!coords && !isLoading && (
        <div className="card border-gold-500/30 bg-gold-500/5 flex items-center gap-3">
          <span className="text-gold-400">📍</span>
          <div className="flex-1">
            <p className="text-sm text-slate-300">Location needed for accurate prayer times</p>
          </div>
          <button onClick={geo.request} className="btn-primary text-sm">
            {geo.loading ? 'Locating…' : 'Allow location'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-900/10 text-red-400 text-sm">
          Failed to load prayer times. {String(error)}
        </div>
      )}

      {/* Countdown */}
      {status && (
        <Countdown nextPrayer={status.next} nextTimeStr={status.nextTimeStr} />
      )}

      {/* Prayer list */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">{"Today's Prayers"}</h2>
        {isLoading ? (
          <div className="space-y-2">
            {PRAYER_ORDER.map((name) => (
              <div key={name} className="card h-16 animate-pulse bg-navy-800" />
            ))}
          </div>
        ) : todayData ? (
          PRAYER_ORDER.map((name) => (
            <PrayerCard
              key={name}
              name={name}
              time={todayData.timings[name]}
              isActive={status?.current === name}
              isNext={status?.next === name}
              timeFormat={timeFormat}
              dayCompletion={dayCompletion}
              onMark={user ? (prayer, completed) => markMutation.mutate({ prayer, completed }) : undefined}
            />
          ))
        ) : null}
      </div>
    </div>
  );
}
