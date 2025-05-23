"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTransition } from "react";
import { updateAlertStatus } from "@/app/actions/alerts";

const statusOptions = [
  "Open",
  "Under Engineering Review",
  "Closed",
];

export function StatusDropdown({
  currentStatus,
  memberName,
  alertSerial,
}: {
  currentStatus: string;
  memberName: string;
  alertSerial: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await updateAlertStatus(alertSerial, "", status);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          {currentStatus}
          <ChevronDown className="text-white" size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-secondary border-gray-dark">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            className="text-white hover:bg-white/5"
            onClick={() => handleStatusChange(status)}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
