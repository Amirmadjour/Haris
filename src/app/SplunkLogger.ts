"use server";

import axios from "axios";
import https from "https";

const SPLUNK_HEC_URL =
  process.env.SPLUNK_HEC_URL || "https://localhost:8088/services/collector";
const SPLUNK_HEC_TOKEN =
  process.env.SPLUNK_HEC_TOKEN || "a1257f6b-a1b4-4411-950f-1177da1d75e0";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⛔️ disables cert validation (dev only)
});

export async function logToSplunk(eventData: {
  message: string;
  level?: "info" | "warn" | "error";
  metadata?: Record<string, any>;
}) {
  if (!SPLUNK_HEC_TOKEN) {
    console.warn("Splunk HEC token not configured");
    return;
  }

  try {
    await axios.post(
      SPLUNK_HEC_URL,
      {
        event: {
          ...eventData,
          timestamp: new Date().toISOString(),
        },
        sourcetype: "_json",
      },
      {
        headers: {
          Authorization: `Splunk ${SPLUNK_HEC_TOKEN}`,
        },
        httpsAgent,
      }
    );
  } catch (error) {
    console.error("Failed to send log to Splunk:", error);
  }
}
