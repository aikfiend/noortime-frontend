import { useState, useEffect } from 'react';

export interface CountdownParts {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function useCountdown(targetTimeStr: string | null): CountdownParts | null {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (!targetTimeStr) {
      setParts(null);
      return;
    }

    const calculate = () => {
      const now = new Date();
      const [h, m] = targetTimeStr.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);

      if (target <= now) {
        // Target is in the past today — count to tomorrow
        target.setDate(target.getDate() + 1);
      }

      const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setParts({ hours, minutes, seconds, totalSeconds });
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetTimeStr]);

  return parts;
}
