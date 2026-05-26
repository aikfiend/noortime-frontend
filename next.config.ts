import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // In production, the ALB routes /api/* directly to the NestJS backend on port 3001.
  // In development, proxy /api/* to the local NestJS server.
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
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
