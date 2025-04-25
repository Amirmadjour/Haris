"use client";

import { useEffect, useState } from "react";
import { type SplunkAlert } from "@/lib/splunkAlerts";
import { toast } from "sonner";
import StatisticCard from "./StatisticCard";
import { DataTable } from "./DataTable";

export default function SplunkAlertListener() {
  const [alerts, setAlerts] = useState<any>();
  const [data, setData] = useState<SplunkAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Check push notification support and permission
  useEffect(() => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setIsPushEnabled(true);
          registerServiceWorker();
        }
      });
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const showPushNotification = (alert: SplunkAlert) => {
    if (!isPushEnabled) return;

    const title = "New Splunk Alert";
    const options = {
      body: alert.message || "New alert received",
      data: {
        url: window.location.href,
        time: new Date(parseInt(alert._time) * 1000).toLocaleString(),
      },
    };

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      // Fallback if service worker isn't ready
      new Notification(title, options);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/sse-alerts", {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onmessage = (e) => {
      try {
        const alert = JSON.parse(e.data) as SplunkAlert;

        setData((prevData) => {
          const newAlertList = [...prevData, alert.result];

          const transformedData = {
            severityCounts: {
              Critical: newAlertList.filter(
                (r: any) => r.severity === "Critical"
              ).length,
              High: newAlertList.filter((r: any) => r.severity === "High")
                .length,
              Medium: newAlertList.filter((r: any) => r.severity === "Medium")
                .length,
              Low: newAlertList.filter((r: any) => r.severity === "Low").length,
            },
            statusCounts: {
              Open: newAlertList.filter((r: any) => r.status === "Open").length,
              Assigned: newAlertList.filter((r: any) => r.status === "Assigned")
                .length,
              EngineeringReview: newAlertList.filter(
                (r: any) => r.status === "Engineering Review"
              ).length,
            },
            caseDetails: newAlertList.map((r: any) => ({
              id: r.id,
              alert: r.alert_name,
              analyst: r.analyst,
              status: r.status,
              severity: r.severity,
            })),
          };

          setAlerts(transformedData);

          toast.success(`New alert: ${alert.result.alert_name}`);
          showPushNotification(alert);

          return newAlertList; 
        });
      } catch (error) {
        console.error("Error parsing alert:", error);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("error");
      eventSource.close();
      setTimeout(() => {
        setConnectionStatus("reconnecting");
      }, 5000);
    };

    return () => {
      eventSource.close();
      setConnectionStatus("disconnected");
    };
  }, []);

  const enablePushNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setIsPushEnabled(true);
      await registerServiceWorker();
      toast.success("Push notifications enabled");
    } else {
      toast.error("Permission denied for notifications");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span
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
            <button
              onClick={enablePushNotifications}
              className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
            >
              Enable Push
            </button>
          )}
        </div>
      </div>

      <div className="px-20 w-full flex items-center justify-center gap-4">
        <StatisticCard
          title="Severity"
          items={[
            { label: "Critical", value: alerts?.severityCounts?.Critical },
            { label: "High", value: alerts?.severityCounts?.High },
            { label: "Medium", value: alerts?.severityCounts?.Medium },
            { label: "Low", value: alerts?.severityCounts?.Low },
          ]}
        />
        <StatisticCard
          title="Status"
          items={[
            { label: "Open", value: alerts?.statusCounts?.Open },
            { label: "Assigned", value: alerts?.statusCounts?.Assigned },
            {
              label: "Engineering review",
              value: alerts?.statusCounts?.EngineeringReview,
            },
          ]}
        />
      </div>
      <DataTable data={alerts?.caseDetails} />
    </div>
  );
}
