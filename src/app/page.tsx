"use client";
import { useEffect, useState } from "react";
import { DataTable } from "./components/DataTable";
import Nav from "./components/Nav";
import StatisticCard from "./components/StatisticCard";

export default function Home() {
  const [alerts, setAlerts] = useState<any>({});

  async function logButtonClick() {
    await fetch("/api/log", {
      method: "POST",
      body: JSON.stringify({
        message: "Button clicked",
        level: "info",
        metadata: { buttonId: "cta-primary" },
      }),
    });
  }

  useEffect(() => {
    fetch("/api/table")
      .then((res) => res.json())
      .then((data) => setAlerts(data));
  }, []);

  return (
    <div className="bg-primary flex flex-col items-center justify-start w-screen h-screen overflow-y-scroll">
      <Nav />
      <div className="px-20 w-full flex flex-col py-5 mt-[140px]">
        <p className="font-poppins font-semibold text-2xl text-white border-b border-brand pb-3 w-fit z-10">
          Cases
        </p>
        <div className="bg-gray-dark w-full h-px"></div>
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
            { label: "Engineering review", value: alerts?.statusCounts?.EngineeringReview },
          ]}
        />
      </div>

      <DataTable data={alerts?.caseDetails}/>
    </div>
  );
}
