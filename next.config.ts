import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: 'assets.unsoed.link',
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
