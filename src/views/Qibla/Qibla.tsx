import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { QiblaCompass } from '@/components/QiblaCompass/QiblaCompass';
import { qiblaApi } from '@/api/client';
import type { QiblaResult } from '@/types';

export function Qibla() {
  const geo = useGeolocation(true);

  const { data, isLoading, error } = useQuery<QiblaResult>({
    queryKey: ['qibla', geo.coords?.latitude, geo.coords?.longitude],
    queryFn: async () =>
      (await qiblaApi.direction(geo.coords!.latitude, geo.coords!.longitude)).data as QiblaResult,
    enabled: !!geo.coords,
  });

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">Qibla Direction</h1>
        <p className="text-slate-400 text-sm mt-1">Direction of the Kaaba from your location</p>
      </div>

      {geo.loading && (
        <div className="card text-center text-slate-400 text-sm py-8">
          Getting your location…
        </div>
      )}

      {geo.error && (
        <div className="card border-red-500/30 bg-red-900/10">
          <p className="text-red-400 text-sm mb-3">{geo.error}</p>
          <button onClick={geo.request} className="btn-primary text-sm">Try again</button>
        </div>
      )}

      {!geo.coords && !geo.loading && !geo.error && (
        <div className="card text-center py-8 space-y-3">
          <p className="text-slate-400 text-sm">Location access needed to show Qibla direction</p>
          <button onClick={geo.request} className="btn-primary text-sm">Allow location</button>
        </div>
      )}

      {isLoading && geo.coords && (
        <div className="card text-center text-slate-400 text-sm py-8 animate-pulse">
          Calculating Qibla…
        </div>
      )}

      {error && (
        <div className="card border-red-500/30 text-red-400 text-sm text-center py-4">
          Failed to fetch Qibla direction. Please try again.
        </div>
      )}

      {data && (
        <>
          <QiblaCompass qiblaDirection={data.direction} />
          <div className="card text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your coordinates</p>
            <p className="text-slate-300 font-mono text-sm">
              {data.latitude.toFixed(4)}°N, {data.longitude.toFixed(4)}°E
            </p>
          </div>
        </>
      )}
    </div>
  );
}
