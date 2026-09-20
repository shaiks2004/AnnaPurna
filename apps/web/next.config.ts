import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['172.20.149.244', 'localhost:3000', '127.0.0.1:3000', 'localhost:3001', '127.0.0.1:3001'],
  async rewrites() {
    const backendOrigin = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8080';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
