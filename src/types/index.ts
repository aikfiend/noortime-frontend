export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLocation {
  user_id: number;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface UserPreferences {
  user_id: number;
  calculation_method: number;
  madhab: number;
  time_format: '12h' | '24h';
}

export interface UserProfile {
  user: User;
  location: UserLocation | null;
  preferences: UserPreferences | null;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type TrackablePrayer = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface DayTimings {
  date: string;
  timings: Record<PrayerName, string>;
}

export interface DayCompletion {
  date: string;
  prayers: Record<TrackablePrayer, boolean>;
  fullyCompleted: boolean;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
}

export interface QiblaResult {
  latitude: number;
  longitude: number;
  direction: number;
}

export interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

export interface Coords {
  latitude: number;
  longitude: number;
}
