// app/api/sse-alerts/route.ts
import { alertEmitter, type SplunkAlert } from "@/lib/splunkAlerts";
import { NextResponse } from "next/server";

export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Connection keep-alive
  const keepAlive = setInterval(() => {
    writer.write(encoder.encode(": keep-alive\n\n")).catch(() => {});
  }, 25000);

  // Alert handler
  const handleAlert = (alert: SplunkAlert) => {
    writer
      .write(encoder.encode(`data: ${JSON.stringify(alert)}\n\n`))
      .catch(() => {});
  };

  alertEmitter.on("alert", handleAlert);

  // Cleanup function
  const cleanup = () => {
    clearInterval(keepAlive);
    alertEmitter.off("alert", handleAlert);
    writer.close().catch(() => {});
  };

  const response = new NextResponse(stream.readable, { headers });

  // Handle client disconnect
  const onClose = () => cleanup();
  const { readable, writable } = new TransformStream();
  response.body?.pipeTo(writable).catch(onClose);

  return response;
}
