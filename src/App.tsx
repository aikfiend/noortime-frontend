import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout/Layout';
import { Landing } from '@/pages/Landing/Landing';
import { AuthError } from '@/pages/AuthError/AuthError';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Schedule } from '@/pages/Schedule/Schedule';
import { Streak } from '@/pages/Streak/Streak';
import { Qibla } from '@/pages/Qibla/Qibla';
import { Mosques } from '@/pages/Mosques/Mosques';
import { Settings } from '@/pages/Settings/Settings';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-4xl animate-pulse-slow">☽</div>
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/streak" element={
          <ProtectedRoute><Streak /></ProtectedRoute>
        } />
        <Route path="/qibla" element={<Qibla />} />
        <Route path="/mosques" element={<Mosques />} />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
