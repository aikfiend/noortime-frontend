import { useState, useEffect } from 'react';
import type { Coords } from '@/types';

interface GeolocationState {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(auto = false): GeolocationState & { request: () => void } {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  });

  const request = () => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({ coords: null, error: err.message, loading: false });
      },
      { timeout: 10_000, enableHighAccuracy: false },
    );
  };

  useEffect(() => {
    if (auto) request();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, request };
}
