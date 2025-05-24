import { NextResponse } from "next/server";
import { updateAlertStatus, updateStatus } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { serial, status } = await request.json();

    if (!serial || !status) {
      return NextResponse.json(
        { error: "Serial and status are required" },
        { status: 400 }
      );
    }

    updateStatus(serial, status);

    return NextResponse.json({ serial, status });
  } catch (err: any) {
    console.error("Update error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
