import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '173.212.208.48' },
    ],
  },
};

export default nextConfig;
