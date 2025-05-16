"use client";
import { useEffect, useState } from "react";
import { DataTable } from "./components/DataTable";
import Nav from "./components/Nav";
import AlertDisplay from "@/app/components/AlertDisplay";
import { getCurrentUserAction } from "./actions/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [alerts, setAlerts] = useState<any>({});
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUserAction();
      console.log("current user: ", currentUser)
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        setUser(currentUser);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsTableLoading(true);
        const response = await fetch("/api/table");
        if (!response.ok) {
          console.log("Response was not ok");
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
  }, [user]);

  if (!user) {
    return <div className="bg-primary w-screen h-screen"></div>;
  }

  return (
    <div className="bg-primary flex flex-col items-center justify-start w-screen h-screen overflow-y-scroll">
      <Nav user={user} />
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
