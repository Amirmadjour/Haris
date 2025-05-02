import { NextResponse } from "next/server";
import { updateAlertStatus } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { serial, status, assignedTo } = await request.json();

    if (!serial || !status) {
      return NextResponse.json(
        { error: "Serial and status are required" },
        { status: 400 }
      );
    }

    updateAlertStatus(serial, status, assignedTo || null);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}