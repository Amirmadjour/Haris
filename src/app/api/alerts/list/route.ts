import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch (err: any) {
    console.error("Database error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}