import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

type PayloadNextConfig = NextConfig & { turbopack?: unknown };

const nextConfig: NextConfig = {
  /* config options here */
};

const config = withPayload(nextConfig) as PayloadNextConfig;

delete config.turbopack;

export default config;
