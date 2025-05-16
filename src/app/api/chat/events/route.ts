import { NextRequest } from "next/server";
import { getOrCreateChatRoom, getChatMessages } from "@/lib/db";

// Store connected clients with proper typing
const clients = new Map<string, (data: string) => void>();

export async function GET(request: NextRequest) {
  const alertSerial = request.nextUrl.searchParams.get("alertSerial");

  if (!alertSerial) {
    return new Response("Alert serial is required", { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Correctly typed send function that accepts string
  const sendEvent = (data: string) => {
    writer.write(encoder.encode(data));
  };

  const clientId = `${alertSerial}-${Date.now()}`;
  clients.set(clientId, sendEvent);

  // Send initial messages (properly stringified)
  try {
    const room = await getOrCreateChatRoom(alertSerial);
    const messages = await getChatMessages(room.id);
    sendEvent(`data: ${JSON.stringify({ type: "init", messages })}\n\n`);
  } catch (error) {
    console.error("Error sending initial messages:", error);
  }

  request.signal.onabort = () => {
    clients.delete(clientId);
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

// Updated broadcast function with proper string conversion
export function broadcastMessage(alertSerial: string, message: object) {
  const messageString = `data: ${JSON.stringify({ type: "message", data: message })}\n\n`;
  clients.forEach((send, clientId) => {
    if (clientId.startsWith(alertSerial)) {
      send(messageString);
    }
  });
}