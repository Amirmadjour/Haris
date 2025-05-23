// src/app/api/chat/events/route.ts
import { NextRequest } from "next/server";
import { getOrCreateChatRoom, getChatMessages } from "@/lib/db";
import { addClient, removeClient, broadcastMessage } from "@/lib/chatUtils";

export async function GET(request: NextRequest) {
  const alertSerial = request.nextUrl.searchParams.get("alertSerial");

  if (!alertSerial) {
    return new Response("Alert serial is required", { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: string) => {
    writer.write(encoder.encode(data));
  };

  const clientId = `${alertSerial}-${Date.now()}`;
  addClient(clientId, sendEvent);

  try {
    const room: any = getOrCreateChatRoom(alertSerial);
    const messages = getChatMessages(room.id);
    sendEvent(`data: ${JSON.stringify({ type: "init", messages })}\n\n`);
  } catch (error) {
    console.error("Error sending initial messages:", error);
  }

  request.signal.onabort = () => {
    removeClient(clientId);
    writer.close();
  };

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
