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
    console.log("handling the alert")
    writer
      .write(encoder.encode(`data: ${JSON.stringify(alert)}\n\n`))
      .catch(() => {});
  };

  alertEmitter.on("alert", handleAlert);

  // Add connection logging
  console.log("New SSE client connected");

  const cleanup = () => {
    clearInterval(keepAlive);
    alertEmitter.off("alert", handleAlert);
    writer.close().catch(() => {});
    console.log("SSE client disconnected");
  };

  // Handle client disconnect
  const response = new NextResponse(stream.readable, { headers });
  response.signal?.addEventListener("abort", cleanup);

  return response;
}
