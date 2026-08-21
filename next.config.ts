import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/ffmpeg-static/**/*',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Diperbesar menjadi 100MB untuk upload video MP4/WebM
    },
  },
  images: {
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
      {
        pathname: '/**',
        search: '?*',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset.bem-unsoed.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
