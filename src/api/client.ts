import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HttpOnly session cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

// Redirect to login on 401 — session expired or not authenticated
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/'
    ) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  profile: () => api.get('/users/me'),
  updateLocation: (data: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    timezone: string;
  }) => api.put('/users/me/location', data),
  updatePreferences: (data: {
    calculation_method?: number;
    madhab?: number;
    time_format?: '12h' | '24h';
  }) => api.put('/users/me/preferences', data),
};

// ── Prayers ───────────────────────────────────────────────────────────────────
export const prayersApi = {
  today: (params?: { lat?: number; lng?: number }) => api.get('/prayers/today', { params }),
  week: (params?: { lat?: number; lng?: number }) => api.get('/prayers/week', { params }),
  month: (params: { year: number; month: number; lat?: number; lng?: number }) =>
    api.get('/prayers/month', { params }),
};

// ── Streaks ───────────────────────────────────────────────────────────────────
export const streaksApi = {
  stats: () => api.get('/streaks/stats'),
  heatmap: (days = 365) => api.get('/streaks/heatmap', { params: { days } }),
  day: (date: string) => api.get(`/streaks/${date}`),
  mark: (date: string, prayer: string) => api.post('/streaks/mark', { date, prayer }),
  unmark: (date: string, prayer: string) => api.delete('/streaks/mark', { data: { date, prayer } }),
};

// ── Qibla ─────────────────────────────────────────────────────────────────────
export const qiblaApi = {
  direction: (lat: number, lng: number) => api.get('/qibla', { params: { lat, lng } }),
};

// ── Mosques ───────────────────────────────────────────────────────────────────
export const mosquesApi = {
  nearby: (lat: number, lng: number, radius?: number) =>
    api.get('/mosques', { params: { lat, lng, radius } }),
};

// ── Holidays ──────────────────────────────────────────────────────────────────
export const holidaysApi = {
  year: (year: number) => api.get('/holidays', { params: { year } }),
};
