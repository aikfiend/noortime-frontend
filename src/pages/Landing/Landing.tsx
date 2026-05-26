import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🕌', title: 'Accurate Prayer Times', desc: 'Powered by AlAdhan with support for all major calculation methods.' },
  { icon: '⏱', title: 'Live Countdown', desc: 'Always know exactly how long until the next prayer.' },
  { icon: '🔥', title: 'Streak Tracking', desc: 'Build consistency with daily prayer streaks and a visual heatmap.' },
  { icon: '🧭', title: 'Qibla Direction', desc: 'Find the direction of prayer with your device compass.' },
  { icon: '🕌', title: 'Nearby Mosques', desc: 'Discover mosques around you with name, address, and distance.' },
  { icon: '📅', title: 'Monthly Schedule', desc: 'Plan ahead with weekly and monthly prayer timetables.' },
];

export function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center relative overflow-hidden">
        {/* Decorative radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <div className="text-7xl mb-6">☽</div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-white">Noor</span>
            <span className="text-emerald-400">Time</span>
          </h1>
          <p className="text-xl text-gold-400 font-light mb-4 font-arabic">
            نور الوقت
          </p>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            Your personal Islamic prayer companion. Track prayers, find Qibla,
            and build a lasting streak — beautifully.
          </p>

          <a
            href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
            className="btn-primary text-base px-8 py-4 rounded-2xl shadow-lg shadow-emerald-900/40"
          >
            <GoogleIcon />
            Continue with Google
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24 w-full">
        <h2 className="text-center text-2xl font-semibold text-slate-300 mb-10">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover:border-emerald-800/60 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-navy-800 py-4 text-center text-xs text-slate-600">
        NoorTime · Prayer times via AlAdhan API
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
