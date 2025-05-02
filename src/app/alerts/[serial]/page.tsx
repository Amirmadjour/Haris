// app/alerts/[serial]/page.tsx
import { notFound } from "next/navigation";
import AlertChat from "./chat";

async function getAlert(serial: string) {
  const res = await fetch(`http://localhost:3000/api/alerts/${serial}`, {
    cache: "no-store", 
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AlertDetailPage({
  params,
}: {
  params: { serial: string };
}) {
  const alert = await getAlert(params.serial);

  if (!alert) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{alert.search_name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">ID</p>
            <p>{alert.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p>{alert.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Severity</p>
            <p>{alert.severity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned To</p>
            <p>{alert.assigned_to || "Unassigned"}</p>
          </div>
        </div>

        {/* Optionally fetch getTeamMembers() server-side similarly */}
        {/* Or move that logic to the API as well */}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Splunk Link</h2>
          <a href="#" className="text-blue-600 hover:underline">
            https://example.com/chat-image-upload-Demo
          </a>
        </div>
      </div>

      <AlertChat alertSerial={params.serial} />
    </div>
  );
}
