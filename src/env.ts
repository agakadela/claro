import 'dotenv/config';
import { z } from 'zod';

/**
 * Server-side env validation. Fails fast at startup if required vars are missing.
 * Import in next.config.ts (build/dev/start) and payload.config.ts (Payload CLI).
 */
const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Payload
    PAYLOAD_SECRET: z
      .string()
      .min(32, 'PAYLOAD_SECRET must be at least 32 characters for session security'),
    DATABASE_URI: z.string().min(1, 'DATABASE_URI is required for MongoDB connection'),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required for webhooks'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    // Multi-tenant / URLs
    NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_ROOT_DOMAIN is required for subdomain routing'),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== 'production' || Boolean(data.BLOB_READ_WRITE_TOKEN?.trim()),
    {
      message: 'BLOB_READ_WRITE_TOKEN is required in production for media uploads',
      path: ['BLOB_READ_WRITE_TOKEN'],
    }
  )
  .refine(
    (data) =>
      data.NODE_ENV !== 'production' || Boolean(data.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()),
    {
      message: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in production for Stripe Checkout',
      path: ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    }
  );

function validateEnv(): z.infer<typeof serverEnvSchema> {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    DATABASE_URI: process.env.DATABASE_URI,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(errors)
      .map(([key, val]) => `${key}: ${(val ?? []).join(', ')}`)
      .join('; ');
    throw new Error(`Invalid server environment: ${msg}`);
  }

  return parsed.data;
}

export const env = validateEnv();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // Augments ProcessEnv with validated schema; empty body required for declaration merging
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof serverEnvSchema> {}
  }
}
