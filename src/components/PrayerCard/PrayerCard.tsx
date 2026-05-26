import type { PrayerName, TrackablePrayer, DayCompletion } from '@/types';

const PRAYER_ICONS: Record<PrayerName, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤',
  Maghrib: '🌇',
  Isha: '🌃',
};

const TRACKABLE = new Set<PrayerName>(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);

interface Props {
  name: PrayerName;
  time: string;
  isActive: boolean;
  isNext: boolean;
  timeFormat: '12h' | '24h';
  dayCompletion?: DayCompletion | null;
  onMark?: (prayer: TrackablePrayer, completed: boolean) => void;
}

function formatTime(time: string, format: '12h' | '24h'): string {
  if (format === '24h') return time;
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function PrayerCard({ name, time, isActive, isNext, timeFormat, dayCompletion, onMark }: Props) {
  const isTrackable = TRACKABLE.has(name);
  const isCompleted = isTrackable && dayCompletion?.prayers[name as TrackablePrayer];

  return (
    <div
      className={`card flex items-center justify-between gap-4 transition-all duration-300
        ${isActive ? 'prayer-active bg-emerald-900/40' : ''}
        ${isNext ? 'border-gold-500/40' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{PRAYER_ICONS[name]}</span>
        <div>
          <p className={`font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-100'}`}>
            {name}
            {isActive && (
              <span className="ml-2 badge bg-emerald-900 text-emerald-400">Now</span>
            )}
            {isNext && !isActive && (
              <span className="ml-2 badge bg-gold-500/20 text-gold-400">Next</span>
            )}
          </p>
          <p className="text-lg font-mono text-slate-300">{formatTime(time, timeFormat)}</p>
        </div>
      </div>

      {isTrackable && onMark && (
        <button
          onClick={() => onMark(name as TrackablePrayer, !isCompleted)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
            ${isCompleted
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'border-slate-600 hover:border-emerald-500'
            }`}
          title={isCompleted ? 'Mark as not prayed' : 'Mark as prayed'}
        >
          {isCompleted && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
