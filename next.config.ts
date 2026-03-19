import './src/env';
import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

type PayloadNextConfig = NextConfig & { turbopack?: unknown };

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'prd.place',
        pathname: '/**',
      },
    ],
  },
};

const config = withPayload(nextConfig) as PayloadNextConfig;

// TODO: Remove this after Payload new version is released + update Next.js to 16
delete config.turbopack;

export default config;
