// app/actions/alerts.ts
"use server";

import api from "@/lib/axios";
import { revalidatePath } from "next/cache";

export async function updateAlertStatus(
  serial: string,
  memberName?: string,
  status?: string,
) {
  try {
    await api.post("/alerts/update-status", {
      serial,
      status: status || "Assigned",
      assignedTo: memberName,
    });
    revalidatePath(`/alerts/${serial}`);
  } catch (error) {
    console.error("Failed to update status:", error);
    throw error;
  }
}

export async function updateStatus(
  serial: string,
  status: string,
) {
  try {
    await api.post("/alerts/update-only-status", {
      serial,
      status: status,
    });
    revalidatePath(`/alerts/${serial}`);
  } catch (error) {
    console.error("Failed to update status:", error);
    throw error;
  }
}

export async function updateAlertSeverity(serial: string, severity: string) {
  try {
    await api.post("/alerts/update-severity", {
      serial,
      severity,
    });
    revalidatePath(`/alerts/${serial}`);
  } catch (error) {
    console.error("Failed to update severity:", error);
    throw error;
  }
}
