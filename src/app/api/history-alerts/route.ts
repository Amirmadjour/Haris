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

function buildSplunkSearchUrl({
  search_name,
  splQuery,
  sid,
}: {
  search_name: any;
  splQuery: any;
  sid: any;
}) {
  const baseUrl = "http://localhost:8000/en-US/app/search/search";
  const savedSearchPath = `/servicesNS/admin/search/saved/searches/${search_name}`;
  const params = new URLSearchParams({
    s: savedSearchPath,
    "display.page.search.mode": "verbose",
    dispatch_sample_ratio: "1",
    workload_pool: "",
    q: splQuery,
    earliest: "-60m@m",
    latest: "now",
    "display.page.search.tab": "events",
    sid: sid,
  });

  return `${baseUrl}?${params.toString()}`;
}

export async function GET() {
  const auth = Buffer.from("admin:MadjourAmir1#").toString("base64");
  const baseUrl = "https://localhost:8089";
  const headers = {
    Authorization: `Basic ${auth}`,
  };
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    // Step 1: Fetch fired alerts (existing implementation)
    const alertsResponse = await axios.get(
      `${baseUrl}/services/alerts/fired_alerts`,
      {
        params: { output_mode: "json" },
        headers,
        httpsAgent: agent,
      }
    );

    const alertDetails = await Promise.all(
      alertsResponse.data.entry
        .filter((entry: any) => entry.name && entry.name !== "-")
        .map(async (entry: any) => {
          const alertName = encodeURIComponent(entry.name);
          const alert = await axios.get(
            `${baseUrl}/services/alerts/fired_alerts/${alertName}`,
            {
              params: { output_mode: "json", count: 1000 },
              headers,
              httpsAgent: agent,
            }
          );
          return alert.data;
        })
    );

    const historicalAlerts = alertDetails
      .flatMap((detail) =>
        detail?.entry.map((entry: any) => {
          console.log("Entry: ", entry);
          return {
            _time: entry?.content?.trigger_time_rendered,
            search_name: entry?.content?.savedsearch_name,
            _serial: entry?.content?.sid,
            severity: mapSeverity(entry?.content?.severity || 0),
            status: "Open",
            trigger_time: entry?.content?.trigger_time,
            splunk_link: buildSplunkSearchUrl({
              search_name: entry?.content?.savedsearch_name,
              splQuery: "search index=500",
              sid: entry?.content?.sid,
            }),
            type: "alert", // Mark as alert
          };
        })
      )
      .filter((alert) => !alertExists(alert._serial));

    console.log("Historical alerts: ", historicalAlerts);

    // Step 2: Fetch all saved searches (alerts + reports)
    const savedSearchesResponse = await axios.get(
      `${baseUrl}/services/saved/searches`,
      {
        params: { output_mode: "json" },
        headers,
        httpsAgent: agent,
      }
    );

    // Step 3: Filter out alerts (we already have them) and process reports
    const reports = savedSearchesResponse.data.entry.filter((search: any) => {
      // Get all alert names from the historicalAlerts we already fetched
      const alertNames = historicalAlerts.map((alert) => alert.search_name);

      return !alertNames.includes(search.name);
    });

    // Step 4: For each report, fetch search history and then events
    const reportDetails = await Promise.all(
      reports.map(async (report: any) => {
        try {
          // Get search history
          const historyResponse = await axios.get(
            `${baseUrl}/servicesNS/nobody/search/saved/searches/${encodeURIComponent(
              report.name
            )}/history`,
            {
              params: { output_mode: "json" },
              headers,
              httpsAgent: agent,
            }
          );

          // Process each historical search job
          const reportAlerts = await Promise.all(
            historyResponse.data.entry.map(async (historyEntry: any) => {
              // Get events for this search job
              const eventsResponse = await axios.get(
                `${historyEntry.id}/events`,
                {
                  params: {
                    output_mode: "json",
                    count: 1000,
                  },
                  headers,
                  httpsAgent: agent,
                }
              );

              return eventsResponse.data.results.map(
                (event: any, index: number) => {
                  console.log("Report", event);
                  return {
                    _time: event._time,
                    search_name: report.name,
                    _serial: historyEntry.name + index,
                    severity: "Info", // Reports typically don't have severity
                    status: "Completed",
                    trigger_time: event._indextime,
                    splunk_link: event.id,
                    type: "report",
                  };
                }
              );
            })
          );

          return reportAlerts.flat();
        } catch (error) {
          console.error(`Error processing report ${report.name}:`, error);
          return [];
        }
      })
    );

    const historicalReports = reportDetails
      .flat()
      .filter((report) => !alertExists(report._serial));

    console.log("historicalReports: ", historicalReports.length);

    // Combine alerts and reports
    const allHistoricalItems = [...historicalAlerts, ...historicalReports].sort(
      (a: any, b: any) => b.trigger_time - a.trigger_time
    );

    if (allHistoricalItems.length > 0) {
      console.log("All historical items: ", allHistoricalItems.length);
      insertAlerts(allHistoricalItems);
    }

    return NextResponse.json({
      newAlerts: historicalAlerts,
      newReports: historicalReports,
      message:
        allHistoricalItems.length > 0
          ? `${allHistoricalItems.length} new items added (${historicalAlerts.length} alerts, ${historicalReports.length} reports)`
          : "No new items found",
    });
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
