import { execSync } from 'node:child_process';
import { NextResponse } from 'next/server';
import { runSeed } from '@/seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function runDbFresh(): void {
  try {
    execSync('npx payload migrate:fresh', {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8',
    });
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; message?: string };
    const output = [err.stderr, err.stdout, err.message]
      .filter(Boolean)
      .map((b) => (Buffer.isBuffer(b) ? b.toString('utf8') : String(b)))
      .join('\n');
    throw new Error(`migrate:fresh failed: ${output || String(error)}`);
  }
}

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json(
      { message: 'SEED_SECRET not configured' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token || token !== secret) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    runDbFresh();
    await runSeed();
    return NextResponse.json(
      { message: 'Database reset and seed completed successfully' },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Database reset or seed failed';
    console.error('[seed]', error);
    return NextResponse.json(
      { message: 'Database reset or seed failed', error: message },
      { status: 500 },
    );
  }
}
