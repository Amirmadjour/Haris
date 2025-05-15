"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTransition } from "react";
import { updateAlertStatus } from "@/app/actions/alerts";

export function AnalystDropdown({
  currentAnalyst,
  teamMembers,
  alertSerial,
  status,
}: {
  currentAnalyst: string | null;
  teamMembers: any[];
  alertSerial: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAssign = (memberName: string) => {
    startTransition(async () => {
      await updateAlertStatus(alertSerial, memberName);
    });
  };

  if (status !== "Open") {
    return <div className="flex items-center gap-1">{currentAnalyst || "No analyst assigned"}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          {currentAnalyst || "Unassigned"}
          <ChevronDown className="text-white" size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-secondary border-gray-dark"
      >
        <DropdownMenuLabel className="text-white">
          Assign to
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-dark" />
        {teamMembers.map((member) => (
          <DropdownMenuItem
            key={member.name}
            className="text-white hover:bg-white/5"
            onClick={() => handleAssign(member.name)}
          >
            {member.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}