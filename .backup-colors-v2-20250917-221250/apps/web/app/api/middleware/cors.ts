import { z } from "zod";
import { NextRequest, NextResponse } from 'next/server';

export function corsMiddleware(req: NextRequest) {
  try {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    // console.error('CORS middleware error:', error);
    return NextResponse.json({ error: 'CORS error' }, { status: 500 });
  }
}
