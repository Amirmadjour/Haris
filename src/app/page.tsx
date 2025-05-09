"use client";
import { useEffect, useState } from "react";
import { DataTable } from "./components/DataTable";
import Nav from "./components/Nav";
import StatisticCard from "./components/StatisticCard";
import AlertDisplay from "@/app/components/AlertDisplay";

export default function Home() {
  const [alerts, setAlerts] = useState<any>({});
  const [isTableLoading, setIsTableLoading] = useState(true);

  /* index=_internal source=*splunkd.log "license" 
| search "Added type=enterprise license" OR "license stack" OR "Successfully added license"
| table _time, host, user, log_level, component, message
| sort -_time */

  // reports
  // email

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsTableLoading(true);
        const response = await fetch("/api/table");
        if (!response.ok) {
          console.log("Response was not ok")
        }
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTableLoading(false);
      }
    };

    fetchData();
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
      <AlertDisplay />
    </div>
  );
}
