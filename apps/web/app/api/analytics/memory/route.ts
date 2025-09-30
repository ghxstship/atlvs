import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const stats = await request.json();

    console.log('Memory Stats:', stats);

    // TODO: Send to monitoring service
    // Example: Send alert if memory > 100MB

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing memory stats:', error);
    return NextResponse.json(
      { error: 'Failed to process stats' },
      { status: 500 }
    );
  }
}
