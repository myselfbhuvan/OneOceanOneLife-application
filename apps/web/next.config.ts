import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  allowedDevOrigins: ['192.168.20.161'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    // Serve media through the site origin so the browser never frames a
    // different origin (Chrome blocks those) and never depends on a direct
    // connection to the API port.
    return [
      {
        source: '/media/:path*',
        destination: 'http://127.0.0.1:8000/media/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://127.0.0.1:8000/static/:path*',
      },
    ];
  },
};

export default nextConfig;
