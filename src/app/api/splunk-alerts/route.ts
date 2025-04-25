import { NextResponse } from 'next/server';
import { alertEmitter, type SplunkAlert } from '@/lib/splunkAlerts';

export async function POST(request: Request) {
  try {
    const alertData = (await request.json()) as SplunkAlert;
    console.log('Alert received:', alertData);

    // Broadcast to all SSE clients
    alertEmitter.emit('alert', alertData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Explicitly declare unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// Add other methods as needed