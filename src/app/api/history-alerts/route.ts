// app/api/alerts/history/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { insertAlerts, alertExists } from "@/lib/db";

export const mapSeverity = (level: number): string => {
  const severityMap = {
    1: "Info",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Critical",
  };

  return severityMap[level as keyof typeof severityMap] || "Unknown";
};

export async function GET() {
  const auth = Buffer.from("admin:MadjourAmir1#").toString("base64");

  try {
    const alertsResponse = await axios.get(
      "https://localhost:8089/services/alerts/fired_alerts",
      {
        params: { output_mode: "json" },
        headers: {
          Authorization: `Basic ${auth}`,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    const alertDetails = await Promise.all(
      alertsResponse.data.entry
        .filter((entry: any) => entry.name && entry.name !== "-")
        .map(async (entry: any) => {
          const alertName = encodeURIComponent(entry.name);
          const alert = await axios.get(
            `https://localhost:8089/services/alerts/fired_alerts/${alertName}`,
            {
              params: { output_mode: "json", count: 1000 },
              headers: {
                Authorization: `Basic ${auth}`,
              },
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }
          );
          return alert.data;
        })
    );

    const historicalAlerts = alertDetails
      .flatMap((detail) =>
        detail?.entry.map((entry: any) => ({
          _time: entry?.content?.trigger_time_rendered,
          search_name: entry?.content?.savedsearch_name,
          _serial: entry?.content?.sid,
          severity: mapSeverity(entry?.content?.severity || 0),
          status: "Open",
          trigger_time: entry?.content?.trigger_time,
        }))
      )
      // Filter out alerts that already exist in our database
      .filter((alert) => !alertExists(alert._serial))
      .sort((a: any, b: any) => b.trigger_time - a.trigger_time);

    if (historicalAlerts.length > 0) {
      // Only insert if we have new alerts
      insertAlerts(historicalAlerts);
    }

    return NextResponse.json({
      newAlerts: historicalAlerts,
      message: historicalAlerts.length > 0 
        ? `${historicalAlerts.length} new alerts added` 
        : "No new alerts found"
    });
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}