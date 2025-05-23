// app/api/alerts/[serial]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: any) {
  try {
    const { serial } = params;

    // SQLite version
    const alert = db.prepare(`
      WITH numbered_alerts AS (
        SELECT a.*, 
               ROW_NUMBER() OVER (ORDER BY trigger_time DESC) as row_num
        FROM alerts a
      )
      SELECT *, 
             '100' || (SELECT COUNT(*) FROM alerts) - row_num + 1 as display_index
      FROM numbered_alerts
      WHERE _serial = ?
    `).get(serial);

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}