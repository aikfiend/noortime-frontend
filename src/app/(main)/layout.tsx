import type { ReactNode } from 'react';
import { Navbar } from '@/components/Layout/Navbar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-navy-800 py-4 text-center text-xs text-slate-600">
        NoorTime · Prayer times via{' '}
        <a href="https://aladhan.com" target="_blank" rel="noreferrer" className="hover:text-slate-400">
          AlAdhan
        </a>
      </footer>
    </div>
  );
}
