import type { NextConfig } from 'next';

// NestJS backend (auth, users, streaks) — always on localhost:3001.
// In dev, Next.js proxies these. In prod, the ALB no longer routes /api/* to port 3001,
// so Next.js rewrites handle the forwarding for the routes that NestJS still owns.
const BACKEND = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/auth/:path*',    destination: `${BACKEND}/api/auth/:path*` },
      { source: '/api/users/:path*',   destination: `${BACKEND}/api/users/:path*` },
      { source: '/api/streaks/:path*', destination: `${BACKEND}/api/streaks/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
