import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { mosquesApi } from '@/api/client';
import type { Mosque } from '@/types';

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

export function Mosques() {
  const geo = useGeolocation(true);
  const [radius, setRadius] = useState(5000);

  const { data, isLoading, error, refetch } = useQuery<Mosque[]>({
    queryKey: ['mosques', geo.coords?.latitude, geo.coords?.longitude, radius],
    queryFn: async () =>
      (await mosquesApi.nearby(geo.coords!.latitude, geo.coords!.longitude, radius)).data as Mosque[],
    enabled: !!geo.coords,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Nearby Mosques</h1>
          {geo.coords && (
            <p className="text-slate-500 text-xs mt-1">
              {geo.coords.latitude.toFixed(4)}, {geo.coords.longitude.toFixed(4)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Radius</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-navy-800 border border-navy-700 text-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={20000}>20 km</option>
          </select>
        </div>
      </div>

      {geo.error && (
        <div className="card border-red-500/30 bg-red-900/10 flex items-center gap-3">
          <p className="text-red-400 text-sm flex-1">{geo.error}</p>
          <button onClick={geo.request} className="btn-primary text-sm">Retry</button>
        </div>
      )}

      {!geo.coords && !geo.loading && !geo.error && (
        <div className="card text-center py-10 space-y-3">
          <div className="text-4xl">🕌</div>
          <p className="text-slate-400">Allow location access to find nearby mosques</p>
          <button onClick={geo.request} className="btn-primary">Allow location</button>
        </div>
      )}

      {(geo.loading || isLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="card border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <span>Failed to load mosques.</span>
          <button onClick={() => refetch()} className="btn-ghost text-sm">Retry</button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="card text-center py-10 text-slate-500">
          No mosques found within {formatDistance(radius)}. Try increasing the radius.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{data.length} mosque{data.length !== 1 ? 's' : ''} found</p>
          {data.map((mosque, i) => (
            <div key={mosque.id} className="card hover:border-emerald-800/60 transition-colors flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-400 font-semibold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{mosque.name}</p>
                <p className="text-sm text-slate-400 truncate mt-0.5">{mosque.address}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-gold-400 font-mono text-sm">{formatDistance(mosque.distance)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
