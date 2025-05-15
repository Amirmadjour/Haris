"use server";

import api from "@/lib/axios";
import { revalidatePath } from "next/cache";

export async function assignAnalyst(serial: string, memberName: string) {
  try {
    await api.post("/alerts/update-status", {
      serial,
      status: "Assigned",
      assignedTo: memberName,
    });
    revalidatePath(`/alerts/${serial}`);
  } catch (error) {
    console.error("Failed to update status:", error);
    throw error;
  }
}