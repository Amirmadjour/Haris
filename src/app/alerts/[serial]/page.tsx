// app/alerts/[serial]/page.tsx
import { notFound } from "next/navigation";
import AlertChat from "./chat";
import Nav from "@/app/components/Nav";

async function getAlert(serial: string) {
  const res = await fetch(`http://localhost:3000/api/alerts/${serial}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}
const getSeverityColor = (severityValue: any) => {
  switch (severityValue) {
    case "Critical":
      return "bg-red-500";
    case "High":
      return "bg-[#FDFD9A] text-black";
    case "Medium":
      return "bg-[#DCFD77] text-black";
    case "Low":
      return "bg-[#C4FDFD] text-black";
    case "Info":
      return "bg-[#C4FD6F] text-black";
    default:
      return "";
  }
};

export default async function AlertDetailPage({
  params,
}: {
  params: { serial: string };
}) {
  const alert = await getAlert(params.serial);
  console.log("alert: ", alert);

  if (!alert) {
    return notFound();
  }

  return (
    <div className="bg-primary flex flex-col items-center justify-start w-screen h-screen overflow-y-scroll px-20">
      <Nav />
      <table className="w-full mt-[140px] text-white mb-4 font-poppins">
        <thead>
          <tr className="*:text-xl font-semibold text-left">
            <th className="py-5">ID</th>
            <th className="py-5">Alert</th>
            <th className="py-5">Analyst</th>
            <th className="py-5">Status</th>
            <th className="py-5">Severity</th>
          </tr>
          <tr>
            <td colSpan={5}>
              <div className="w-full h-px bg-border" />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr className="text-left">
            <td className="py-3">{alert.id}</td>
            <td className="py-3">{alert.search_name}</td>
            <td className="py-3">{alert.assigned_to || "Unassigned"}</td>
            <td className="py-3">{alert.status}</td>
            <td className="py-3">
              <div
                className={`${getSeverityColor(
                  alert.severity
                )} w-fit h-fit p-2 rounded-md`}
              >
                {alert.severity}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Optionally fetch getTeamMembers() server-side similarly */}
      {/* Or move that logic to the API as well */}

      <div className="w-full flex gap-4">
        <AlertChat alertSerial={params.serial} />
        <div className="mb-6 w-[50%] bg-secondary h-fit p-4 rounded-2xl border border-border">
          <h2 className="text-lg font-semibold mb-2 text-white">Splunk Link</h2>
          <a href={alert.splunk_link} className="text-blue-600 hover:underline" target="_blank">
            {alert.splunk_link}
          </a>
        </div>
      </div>
    </div>
  );
}
