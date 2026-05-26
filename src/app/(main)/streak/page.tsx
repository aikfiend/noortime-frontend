'use client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Streak } from '@/views/Streak/Streak';

export default function StreakPage() {
  return (
    <ProtectedRoute>
      <Streak />
    </ProtectedRoute>
  );
}
