import Image from 'next/image';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';

const CALCULATION_METHODS = [
  { id: 0,  name: 'Shia Ithna-Ansari' },
  { id: 1,  name: 'University of Islamic Sciences, Karachi' },
  { id: 2,  name: 'ISNA (North America)' },
  { id: 3,  name: 'Muslim World League' },
  { id: 4,  name: 'Umm Al-Qura University, Makkah' },
  { id: 5,  name: 'Egyptian General Authority of Survey' },
  { id: 7,  name: 'Institute of Geophysics, University of Tehran' },
  { id: 8,  name: 'Gulf Region' },
  { id: 9,  name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura' },
  { id: 12, name: 'Union Organization Islamic de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
  { id: 15, name: 'Moonsighting Committee Worldwide' },
];

export function Settings() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['users', 'me'],
    queryFn: async () => (await usersApi.profile()).data as UserProfile,
    enabled: !!user,
  });

  const [method, setMethod] = useState<number | null>(null);
  const [madhab, setMadhab] = useState<number | null>(null);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h' | null>(null);
  const [saved, setSaved] = useState(false);

  const currentMethod = method ?? profile?.preferences?.calculation_method ?? 2;
  const currentMadhab = madhab ?? profile?.preferences?.madhab ?? 0;
  const currentFormat = timeFormat ?? profile?.preferences?.time_format ?? '24h';

  const prefMutation = useMutation({
    mutationFn: () => usersApi.updatePreferences({
      calculation_method: currentMethod,
      madhab: currentMadhab,
      time_format: currentFormat,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      qc.invalidateQueries({ queryKey: ['prayers'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) {
    return <div className="text-slate-500 text-sm">Loading settings…</div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      {/* Account */}
      {user && (
        <div className="card flex items-center gap-4">
          {user.avatar_url && (
            <Image src={user.avatar_url} alt={user.name} width={48} height={48} className="rounded-full ring-2 ring-navy-700" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <button onClick={() => logout()} className="btn-ghost text-sm text-red-400 hover:text-red-300">
            Sign out
          </button>
        </div>
      )}

      {/* Prayer Preferences */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-300">Prayer Calculation</h2>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Calculation Method</label>
          <select
            value={currentMethod}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="w-full bg-navy-900 border border-navy-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            {CALCULATION_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Asr Calculation (Madhab)</label>
          <div className="flex gap-2">
            {[{ id: 0, label: 'Shafi / Hanbali / Maliki' }, { id: 1, label: 'Hanafi' }].map((m) => (
              <button
                key={m.id}
                onClick={() => setMadhab(m.id)}
                className={`flex-1 py-2 rounded-xl text-sm border transition-colors
                  ${currentMadhab === m.id
                    ? 'bg-emerald-700 border-emerald-600 text-white'
                    : 'border-navy-700 text-slate-400 hover:text-white'
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Time Format</label>
          <div className="flex gap-2">
            {(['24h', '12h'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFormat(f)}
                className={`px-6 py-2 rounded-xl text-sm border transition-colors
                  ${currentFormat === f
                    ? 'bg-emerald-700 border-emerald-600 text-white'
                    : 'border-navy-700 text-slate-400 hover:text-white'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => prefMutation.mutate()}
          disabled={prefMutation.isPending}
          className="btn-primary w-full justify-center"
        >
          {prefMutation.isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save Preferences'}
        </button>
      </div>

      {/* About */}
      <div className="card bg-navy-900 border-navy-700 text-sm text-slate-500 space-y-1">
        <p>Prayer times from <a href="https://aladhan.com" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">AlAdhan API</a></p>
        <p>Mosque data from Google Places API / OpenStreetMap</p>
        <p className="pt-1 text-slate-600">NoorTime v1.0.0</p>
      </div>
    </div>
  );
}
