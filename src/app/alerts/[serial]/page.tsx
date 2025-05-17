import { notFound, redirect } from "next/navigation";
import AlertChat from "./chat";
import Nav from "@/app/components/Nav";
import { getCurrentUserAction } from "@/app/actions/auth";
import api from "@/lib/axios";
import { AnalystDropdown } from "@/app/components/AnalystDropDown";
import { StatusDropdown } from "@/app/components/StatusDropDown";
import { SeverityDropdown } from "@/app/components/SeverityDropDown";

async function getAlert(serial: string) {
  try {
    const response = await api.get(`/alerts/${serial}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

async function getTeamMembers() {
  try {
    const response = await api.get("/team-members");
    return response.data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

const getSeverityColor = (severityValue: string) => {
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
  const { serial } = params;

  const alert = await getAlert(serial);
  const currentUser = await getCurrentUserAction();
  const teamMembers = await getTeamMembers();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (!alert) {
    return notFound();
  }

  return (
    <div className="bg-primary flex flex-col items-center justify-start w-screen h-screen overflow-y-scroll px-20">
      <Nav user={currentUser} />
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
            <td className="py-3">{alert.display_index}</td>
            <td className="py-3">{alert.search_name}</td>
            <td className="py-3">
              <AnalystDropdown
                currentAnalyst={alert.assigned_to}
                teamMembers={teamMembers}
                alertSerial={alert._serial}
                status={alert.status}
              />
            </td>
            <td className="py-3">
              <StatusDropdown
                currentStatus={alert.status}
                alertSerial={alert._serial}
                memberName={alert.assigned_to}
              />
            </td>
            <td className="py-3">
              <div
                className={`${getSeverityColor(
                  alert.severity
                )} w-fit h-fit p-2 rounded-md`}
              >
                <SeverityDropdown
                  currentSeverity={alert.severity}
                  alertSerial={alert._serial}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="w-full flex gap-4">
        <AlertChat alertSerial={alert._serial} currentUser={currentUser!} />
        <div className="mb-6 max-w-[40%] bg-secondary h-fit p-4 rounded-2xl border border-border">
          <h2 className="text-lg font-semibold mb-2 text-white">Splunk Link</h2>
          <a
            href={alert.splunk_link}
            className="text-blue-600 hover:underline wrap-anywhere"
            target="_blank"
          >
            {alert.splunk_link}
          </a>
        </div>
      </div>
    </div>
  );
}
