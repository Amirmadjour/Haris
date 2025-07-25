"use client";

import { useEffect, useState, useRef } from "react";
import { type SplunkAlert } from "@/lib/splunkAlerts";
import { toast } from "sonner";
import StatisticCard from "./StatisticCard";
import { DataTable } from "./DataTable";

const transformData = (data: any) => {
  return {
    severityCounts: {
      Critical: data?.filter((r: any) => r.severity === "Critical").length,
      High: data?.filter((r: any) => r.severity === "High").length,
      Medium: data?.filter((r: any) => r.severity === "Medium").length,
      Low: data?.filter((r: any) => r.severity === "Low").length,
      Info: data?.filter((r: any) => r.severity === "Info").length,
    },
    statusCounts: {
      Open: data?.filter((r: any) => r.status === "Open").length,
      Assigned: data?.filter((r: any) => r.status === "Assigned").length,
      UnderEngineeringReview: data?.filter(
        (r: any) => r.status === "Under Engineering Review"
      ).length,
    },
    caseDetails: data?.map((r: any, index: number) => ({
      id: r.display_index,
      alert: r.search_name,
      analyst: r.assigned_to || "No analyst assigned",
      status: r.status,
      severity: r.severity,
      _serial: r._serial,
    })),
  };
};

export default function SplunkAlertListener() {
  const [alerts, setAlerts] = useState<any>({});
  const [data, setData] = useState<SplunkAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout>(null);
  let AlertsNumber = 0;

  const fetchAlerts = async () => {
    try {
      const alertsResponse = await fetch("/api/alerts/list");
      const alertsList = await alertsResponse.json();

      if (alertsList.length === 0) return;
      if (alertsList.length !== AlertsNumber && AlertsNumber !== 0) {
        toast.success(
          `New alert: ${alertsList[0].search_name}`
        );
      }
      AlertsNumber = alertsList.length;
      setData(alertsList);
      setAlerts(transformData(alertsList));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  // Add this function to fetch historical alerts
  const fetchHistoricalAlerts = async () => {
    try {
      const res = await fetch("/api/history-alerts");
      const data = await res.json();

      await fetchAlerts();
    } catch (err) {
      console.error("Client failed to fetch alerts:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Setup polling interval
  const startPolling = () => {
    // Clear existing interval if any
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set new interval
    pollingIntervalRef.current = setInterval(() => {
      fetchHistoricalAlerts();
    }, 5000); // 5 seconds
  };

  // Add this useEffect for initial historical data load
  useEffect(() => {
    fetchHistoricalAlerts();
    startPolling();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/sse-alerts");

    eventSource.onopen = () => {
      setConnectionStatus("connected");
      console.log("SSE connection established");
    };

    eventSource.onmessage = (e) => {
      console.log("Received raw SSE message:", e.data); // Log raw data
      try {
        const alert = JSON.parse(e.data) as SplunkAlert;
        // Fetch updated alerts when SSE message is received
        fetchAlerts();
        toast.success(`New alert: ${alert.search_name}`);
      } catch (error) {
        console.error("Error parsing alert:", error);
      }
    };

    eventSource.onerror = (e) => {
      console.error("SSE error:", e);
      setConnectionStatus("error");
      // Ensure polling continues when SSE fails
      startPolling();
    };

    return () => {
      console.log("Cleaning up SSE connection");
      eventSource.close();
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {/*<span
            className={`px-3 py-1 rounded-full text-sm ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {connectionStatus.toUpperCase()}
          </span>
          {!isPushEnabled && (
            <bAnalyst
utton
              onClick={enablePushNotifications}
              className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
            >
              Enable Push
            </button>
          )*/}
        </div>
      </div>

      <div className="px-20 w-full flex items-center justify-center gap-4 h-auto">
        <StatisticCard
          title="Severity"
          items={[
            {
              label: "Critical",
              value: alerts?.severityCounts?.Critical,
              color: "#F57960",
            },
            {
              label: "High",
              value: alerts?.severityCounts?.High,
              color: "#FDFD9A",
            },
            {
              label: "Medium",
              value: alerts?.severityCounts?.Medium,
              color: "#DCFD77",
            },
            {
              label: "Low",
              value: alerts?.severityCounts?.Low,
              color: "#C4FDFD",
            },
            {
              label: "Info",
              value: alerts?.severityCounts?.Info,
              color: "#ffffff",
            },
          ]}
        />
        <StatisticCard
          title="Status"
          items={[
            {
              label: "Open",
              value: alerts?.statusCounts?.Open,
              color: "#C4FDFD",
            },
            {
              label: "Assigned",
              value: alerts?.statusCounts?.Assigned,
            },
            {
              label: "Under Engineering Review",
              value: alerts?.statusCounts?.UnderEngineeringReview,
              color: "#FCFFAA",
            },
          ]}
        />
      </div>
      <DataTable data={alerts?.caseDetails} isLoading={isLoadingHistory} />
    </div>
  );
}
