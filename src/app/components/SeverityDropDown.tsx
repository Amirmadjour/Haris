"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTransition } from "react";
import { updateAlertSeverity } from "@/app/actions/alerts";

const severityOptions = ["Critical", "High", "Medium", "Low", "Info"];

export function SeverityDropdown({
  currentSeverity,
  alertSerial,
}: {
  currentSeverity: string;
  alertSerial: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSeverityChange = (severity: string) => {
    startTransition(async () => {
      await updateAlertSeverity(alertSerial, severity);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          {currentSeverity}
          <ChevronDown className="text-black" size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-secondary border-gray-dark">
        {severityOptions.map((severity) => (
          <DropdownMenuItem
            key={severity}
            className="text-white hover:bg-white/5"
            onClick={() => handleSeverityChange(severity)}
          >
            {severity}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}