import { Suspense } from 'react';
import { AuthError } from '@/views/AuthError/AuthError';

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}
