'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Settings } from '@/views/Settings/Settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
