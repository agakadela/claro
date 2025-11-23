import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

type PayloadNextConfig = NextConfig & { turbopack?: unknown };

const nextConfig: NextConfig = {
  /* config options here */
};

const config = withPayload(nextConfig) as PayloadNextConfig;

// TODO: Remove this after Payload new version is released + update Next.js to 16
delete config.turbopack;

export default config;
