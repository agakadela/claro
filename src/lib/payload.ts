import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * Cached Payload instance. Prevents new MongoDB connections per request.
 * Uses globalThis so the cache survives Next.js HMR in development.
 *
 * @see https://github.com/payloadcms/next-payload/blob/main/templates/payloadClient.ts
 * @see https://github.com/payloadcms/next-payload/issues/15
 */
const globalForPayload = globalThis as unknown as {
  payload: ReturnType<typeof getPayload> | undefined;
};

export const getPayloadCached = () => {
  if (!globalForPayload.payload) {
    globalForPayload.payload = getPayload({ config: configPromise });
  }
  return globalForPayload.payload;
};
