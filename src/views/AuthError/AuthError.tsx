'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, { title: string; body: string }> = {
  domain_not_allowed: {
    title: 'Access Restricted',
    body: 'NoorTime is only available to @clips4sale.com accounts. Please sign in with your Clips4Sale Google account.',
  },
  no_email: {
    title: 'No Email Provided',
    body: 'Your Google account did not share an email address. Please try again and grant email access.',
  },
  login_failed: {
    title: 'Login Failed',
    body: "We couldn't complete the sign-in process. Please try again.",
  },
  auth_failed: {
    title: 'Authentication Failed',
    body: 'Something went wrong during sign-in. Please try again.',
  },
};

const FALLBACK = {
  title: 'Authentication Error',
  body: 'An unexpected error occurred during sign-in.',
};

export function AuthError() {
  const params = useSearchParams();
  const reason = params.get('reason') ?? 'auth_failed';
  const { title, body } = MESSAGES[reason] ?? FALLBACK;

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-800/50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-slate-400 leading-relaxed">{body}</p>
        </div>

        {/* Domain badge */}
        {reason === 'domain_not_allowed' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 border border-navy-700">
            <span className="text-slate-500 text-sm">Required domain:</span>
            <span className="text-emerald-400 font-mono text-sm font-medium">@clips4sale.com</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href="/api/auth/google"
            className="btn-primary justify-center"
          >
            Try a different account
          </a>
          <Link href="/" className="btn-ghost justify-center">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
