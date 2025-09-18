import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date().toISOString();
  return NextResponse.json(
    {
      name: 'ghxstship-api',
      version: 'v1',
      time: now,
      status: 'ok',
      checks: {
        app: 'ok'
      }
    },
    { status: 200 }
  );
}
