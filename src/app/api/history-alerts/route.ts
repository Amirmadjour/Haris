// app/api/alerts/history/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

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
          status: "Open", // by default
          trigger_time: entry?.content?.trigger_time,
        }))
      )
      .sort((a: any, b: any) => b.trigger_time - a.trigger_time);

    console.log("Historical alerts: ", historicalAlerts);

    return NextResponse.json(historicalAlerts);
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
