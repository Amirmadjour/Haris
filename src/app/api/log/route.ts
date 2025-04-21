import { logToSplunk } from '@/app/SplunkLogger';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  await logToSplunk(data);
  return NextResponse.json({ success: true });
}