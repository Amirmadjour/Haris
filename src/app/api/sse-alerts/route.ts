// app/api/sse-alerts/route.ts
import { alertEmitter, type SplunkAlert } from "@/lib/splunkAlerts";
import { NextResponse } from "next/server";

export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const keepAlive = setInterval(() => {
    writer.write(encoder.encode(": keep-alive\n\n")).catch(() => {});
  }, 25000);

  const handleAlert = (alert: SplunkAlert) => {
    console.log("handling the alert");
    writer
      .write(encoder.encode(`data: ${JSON.stringify(alert)}\n\n`))
      .catch(() => {});
  };

  alertEmitter.on("alert", handleAlert);

  console.log("New SSE client connected");

  const cleanup = () => {
    clearInterval(keepAlive);
    alertEmitter.off("alert", handleAlert);
    writer.close().catch(() => {});
    console.log("SSE client disconnected");
  };

  // Alternative approach to detect client disconnection
  // This is a workaround since NextResponse doesn't expose the request signal
  // The connection will eventually be cleaned up when the stream is closed
  // You might want to implement a heartbeat check or timeout mechanism

  return new NextResponse(stream.readable, { headers });
}