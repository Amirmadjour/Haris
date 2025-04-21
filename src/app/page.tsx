"use client";
import { DataTable } from "./components/DataTable";
import Nav from "./components/Nav";
import StatisticCard from "./components/StatisticCard";

export default function Home() {
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
            { label: "Open", value: 12 },
            { label: "High", value: 5 },
            { label: "Medium", value: 7 },
            { label: "Low", value: 0 },
          ]}
        />
        <StatisticCard
          title="Status"
          items={[
            { label: "Open", value: 1 },
            { label: "Assigned", value: 3 },
            { label: "engineering review", value: 4 },
          ]}
        />
      </div>
      <button onClick={logButtonClick} className="bg-white w-40 h-10">Click Me</button>
      <DataTable />
    </div>
  );
}
