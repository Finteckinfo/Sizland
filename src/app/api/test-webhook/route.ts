import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  console.log('🧪 Test webhook endpoint accessed');
  
  return NextResponse.json({ 
    message: 'Test webhook endpoint is working',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = req.headers;
  
  console.log('🧪 Test webhook POST received:', {
    timestamp: new Date().toISOString(),
    bodyLength: body.length,
    headers: Object.fromEntries(headersList.entries())
  });
  
  return NextResponse.json({ 
    message: 'Test webhook POST endpoint is working',
    timestamp: new Date().toISOString(),
    method: 'POST',
    bodyReceived: body.length > 0
  });
}
