import { NextResponse } from "next/server";
import db, { addChatMessage } from "@/lib/db";
import { getOrCreateChatRoom, getChatMessages } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const alertSerial = request.nextUrl.searchParams.get("alertSerial");

  if (!alertSerial) {
    return NextResponse.json(
      { error: "Alert serial is required" },
      { status: 400 }
    );
  }

  try {
    const room: any = getOrCreateChatRoom(alertSerial);
    const messages = getChatMessages(room.id);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { alertSerial, sender, message, mentions } = await request.json();

  if (!alertSerial || !sender || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const room: any = getOrCreateChatRoom(alertSerial);
    addChatMessage(room.id, sender, message, mentions);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
