import { useState, useEffect } from 'react';

interface Props {
  qiblaDirection: number;
}

export function QiblaCompass({ qiblaDirection }: Props) {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionState('unsupported');
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is available on iOS (degrees from magnetic north)
      const heading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
        ?? (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null) {
        setDeviceHeading(heading);
        setPermissionState('granted');
      }
    };

    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      setPermissionState('prompt');
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }
  }, []);

  const requestPermission = async () => {
    const Evt = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (Evt.requestPermission) {
      const result = await Evt.requestPermission();
      if (result === 'granted') {
        setPermissionState('granted');
        window.addEventListener('deviceorientation', (e) => {
          const heading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
            ?? (e.alpha !== null ? 360 - e.alpha : null);
          if (heading !== null) setDeviceHeading(heading);
        }, true);
      } else {
        setPermissionState('denied');
      }
    }
  };

  // Needle rotation: qibla bearing relative to device heading
  const needleRotation = deviceHeading !== null
    ? (qiblaDirection - deviceHeading + 360) % 360
    : qiblaDirection;

  return (
    <div className="card flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        {/* Compass rose */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="95" fill="#0f2147" stroke="#1a3a6b" strokeWidth="2" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="#1a3a6b" strokeWidth="0.5" />

          {/* Cardinal directions */}
          {['N', 'E', 'S', 'W'].map((dir, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 100 + 78 * Math.cos(rad);
            const y = 100 + 78 * Math.sin(rad);
            return (
              <text key={dir} x={x} y={y} textAnchor="middle" dominantBaseline="central"
                className="fill-slate-400 text-sm" fontSize="12" fontFamily="Inter, sans-serif">
                {dir}
              </text>
            );
          })}

          {/* Tick marks */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = i * 10;
            const rad = (angle - 90) * (Math.PI / 180);
            const r1 = i % 3 === 0 ? 82 : 85;
            const r2 = 90;
            return (
              <line key={i}
                x1={100 + r1 * Math.cos(rad)} y1={100 + r1 * Math.sin(rad)}
                x2={100 + r2 * Math.cos(rad)} y2={100 + r2 * Math.sin(rad)}
                stroke="#1a3a6b" strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
              />
            );
          })}

          {/* Qibla needle */}
          <g transform={`rotate(${needleRotation} 100 100)`}>
            {/* Gold needle tip pointing to qibla */}
            <polygon points="100,20 95,100 105,100" fill="#f59e0b" opacity="0.9" />
            {/* Dark tail */}
            <polygon points="100,180 95,100 105,100" fill="#475569" opacity="0.6" />
            {/* Kaaba icon at tip */}
            <rect x="96" y="14" width="8" height="8" rx="1" fill="#f59e0b" />
          </g>

          {/* Center pin */}
          <circle cx="100" cy="100" r="6" fill="#0a1628" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-gold-400 font-semibold text-lg">
          {qiblaDirection.toFixed(1)}° from North
        </p>
        {deviceHeading !== null ? (
          <p className="text-emerald-400 text-sm mt-1">Live compass active</p>
        ) : permissionState === 'prompt' && typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function' ? (
          <button onClick={requestPermission} className="btn-primary mt-3 text-sm">
            Enable Live Compass
          </button>
        ) : permissionState === 'unsupported' ? (
          <p className="text-slate-500 text-sm mt-1">Static direction (device compass unavailable)</p>
        ) : (
          <p className="text-slate-500 text-sm mt-1">Static direction shown</p>
        )}
      </div>
    </div>
  );
}
