import { useCountdown } from '@/hooks/useCountdown';
import type { PrayerName } from '@/types';

interface Props {
  nextPrayer: PrayerName | null;
  nextTimeStr: string | null;
}

export function Countdown({ nextPrayer, nextTimeStr }: Props) {
  const countdown = useCountdown(nextTimeStr);

  if (!nextPrayer || !countdown) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="card flex flex-col items-center gap-3 py-8">
      <p className="text-sm text-slate-400 uppercase tracking-widest">Next prayer</p>
      <p className="text-2xl font-semibold text-gold-400">{nextPrayer}</p>
      <div className="flex items-center gap-1 font-mono">
        <Digit value={pad(countdown.hours)} label="hr" />
        <span className="text-3xl text-slate-500 pb-5">:</span>
        <Digit value={pad(countdown.minutes)} label="min" />
        <span className="text-3xl text-slate-500 pb-5">:</span>
        <Digit value={pad(countdown.seconds)} label="sec" />
      </div>
      {nextTimeStr && (
        <p className="text-slate-500 text-sm">at {nextTimeStr}</p>
      )}
    </div>
  );
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-xs text-slate-500 mt-0.5">{label}</span>
    </div>
  );
}
