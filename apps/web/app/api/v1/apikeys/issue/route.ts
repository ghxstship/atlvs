import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API endpoint will be available in a future release'
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'API endpoint will be available in a future release'
  }, { status: 501 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    error: 'API endpoint will be available in a future release'
  }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'API endpoint will be available in a future release'
  }, { status: 501 });
}
