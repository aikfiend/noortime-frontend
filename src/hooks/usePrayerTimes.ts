import { useQuery } from '@tanstack/react-query';
import { prayersApi } from '@/api/client';
import type { Coords, DayTimings, PrayerName } from '@/types';

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export interface PrayerStatus {
  current: PrayerName | null;
  next: PrayerName | null;
  nextTimeStr: string | null;
}

export function computePrayerStatus(timings: Record<PrayerName, string>): PrayerStatus {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let current: PrayerName | null = null;
  let next: PrayerName | null = null;
  let nextTimeStr: string | null = null;

  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const name = PRAYER_ORDER[i];
    const minutes = timeToMinutes(timings[name]);

    if (nowMinutes >= minutes) {
      current = name;
    } else if (!next) {
      next = name;
      nextTimeStr = timings[name];
    }
  }

  // After Isha, next is tomorrow's Fajr (we don't have it so just mark Fajr)
  if (!next) {
    next = 'Fajr';
    nextTimeStr = timings['Fajr'];
  }

  return { current, next, nextTimeStr };
}

export function useTodayPrayers(coords: Coords | null) {
  return useQuery<DayTimings>({
    queryKey: ['prayers', 'today', coords?.latitude, coords?.longitude],
    queryFn: async () => {
      const params = coords
        ? { lat: coords.latitude, lng: coords.longitude }
        : undefined;
      const res = await prayersApi.today(params);
      return res.data as DayTimings;
    },
    enabled: true,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWeekPrayers(coords: Coords | null) {
  return useQuery<DayTimings[]>({
    queryKey: ['prayers', 'week', coords?.latitude, coords?.longitude],
    queryFn: async () => {
      const params = coords
        ? { lat: coords.latitude, lng: coords.longitude }
        : undefined;
      const res = await prayersApi.week(params);
      return res.data as DayTimings[];
    },
    enabled: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useMonthPrayers(coords: Coords | null, year: number, month: number) {
  return useQuery<DayTimings[]>({
    queryKey: ['prayers', 'month', coords?.latitude, coords?.longitude, year, month],
    queryFn: async () => {
      const params = coords
        ? { lat: coords.latitude, lng: coords.longitude, year, month }
        : { year, month };
      const res = await prayersApi.month(params);
      return res.data as DayTimings[];
    },
    enabled: true,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
