// app/api/alerts/history/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { insertAlerts, alertExists } from "@/lib/db";

const mapSeverity = (level: number): string => {
  const severityMap = {
    1: "Info",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Critical",
  };

  return severityMap[level as keyof typeof severityMap] || "Unknown";
};

function buildSplunkReportUrl(reportName: string, sid: string): string {
  const baseUrl = process.env.SPLUNK_UI_BASE_URL;
  const params = new URLSearchParams({
    locale: "en-US",
    s: reportName,
    sid: sid,
    "display.page.search.mode": "smart",
    "dispatch.sample_ratio": "1",
    earliest: "-1d",
    latest: "now",
  });
  return `${baseUrl}/en-US/app/search/report?${params.toString()}`;
}

function buildSplunkSearchUrl({
  search_name,
  splQuery,
  sid,
}: {
  search_name: any;
  splQuery: any;
  sid: any;
}) {
  const baseUrl = process.env.SPLUNK_UI_BASE_URL + "/en-US/app/search/search";
  const savedSearchPath = `/servicesNS/admin/search/saved/searches/${search_name}`;
  const params = new URLSearchParams({
    s: savedSearchPath,
    "display.page.search.mode": "verbose",
    dispatch_sample_ratio: "1",
    workload_pool: "",
    q: splQuery,
    earliest: process.env.SPLUNK_SEARCH_EARLIEST || "-60m@m",
    latest: process.env.SPLUNK_SEARCH_LATEST || "now",
    sid: sid,
  });

  return `${baseUrl}?${params.toString()}`;
}

export async function GET() {
  const auth = Buffer.from(
    `${process.env.SPLUNK_USERNAME}:${process.env.SPLUNK_PASSWORD}`
  ).toString("base64");
  const baseUrl = process.env.SPLUNK_BASE_URL;
  const headers = {
    Authorization: `Basic ${auth}`,
  };
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const alertsResponse = await axios.get(
      `${baseUrl}/services/alerts/fired_alerts`,
      {
        params: { output_mode: "json" },
        headers,
        httpsAgent: agent,
      }
    );

    const savedSearchesResponse = await axios.get(
      `${baseUrl}/services/saved/searches`,
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

    const alertNames = alertsResponse.data.entry
      .filter((entry: any) => entry.name && entry.name !== "-")
      .map((entry: any) => entry.name);

    const historicalAlerts = alertDetails
      .flatMap((detail) =>
        detail?.entry.map((entry: any) => {
          const splQuery = savedSearchesResponse.data.entry.find(
            (entry_s: any) => {
              return entry_s?.name === entry?.content?.savedsearch_name;
            }
          )?.content?.qualifiedSearch;

          return {
            _time: entry?.content?.trigger_time_rendered,
            search_name: entry?.content?.savedsearch_name,
            _serial: entry?.content?.sid,
            severity: mapSeverity(entry?.content?.severity || 0),
            status: "Open",
            trigger_time: entry?.content?.trigger_time,
            splunk_link: buildSplunkSearchUrl({
              search_name: entry?.content?.savedsearch_name,
              splQuery: splQuery,
              sid: entry?.content?.sid,
            }),
            type: "alert",
          };
        })
      )
      .filter(async (alert) => !alertExists(alert._serial));

    const reports = savedSearchesResponse.data.entry.filter((search: any) => {
      return !alertNames.includes(search.name);
    });

    const reportDetails = await Promise.all(
      reports.map(async (report: any) => {
        try {
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

          // Only process reports that have history entries with events
          const validReports = await Promise.all(
            historyResponse.data.entry.map(async (historyEntry: any) => {
              try {
                const eventsResponse = await axios.get(
                  `${historyEntry.id}/events`,
                  {
                    params: {
                      output_mode: "json",
                      count: 1, // Just check if there are any events
                    },
                    headers,
                    httpsAgent: agent,
                  }
                );

                if (
                  eventsResponse.data.results &&
                  eventsResponse.data.results.length > 0
                ) {
                  const sidTimestamp =
                    historyEntry.name.match(/_at_(\d+)_/)?.[1];
                  let triggerTime = sidTimestamp
                    ? new Date(parseInt(sidTimestamp) * 1000).toISOString()
                    : null;
                  console.log("triggerTime", triggerTime);
                  return {
                    _time: sidTimestamp,
                    search_name: report.name,
                    _serial: historyEntry.name,
                    severity: "Info",
                    status: "Open",
                    trigger_time: sidTimestamp,
                    splunk_link: buildSplunkReportUrl(
                      report.name,
                      historyEntry.name
                    ),
                    type: "report",
                  };
                }
                return null;
              } catch (error) {
                console.error(
                  `Error checking events for report ${report.name}:`,
                  error
                );
                return null;
              }
            })
          );

          return validReports.filter((report) => report !== null);
        } catch (error) {
          console.error(`Error processing report ${report.name}:`, error);
          return [];
        }
      })
    );

    const historicalReports = reportDetails
      .flat()
      .filter((report) => report !== null && !alertExists(report._serial));

    const allHistoricalItems = [...historicalAlerts, ...historicalReports].sort(
      (a: any, b: any) => b.trigger_time - a.trigger_time
    );

    if (allHistoricalItems.length > 0) {
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
