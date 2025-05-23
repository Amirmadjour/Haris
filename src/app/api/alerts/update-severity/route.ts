// app/api/alerts/update-severity/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { serial, severity } = await req.json();

    const stmt = db.prepare(
      `UPDATE alerts 
       SET severity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE _serial = ?`
    );

    const result = stmt.run(severity, serial);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Alert not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating severity:", error);
    return NextResponse.json(
      { error: "Failed to update severity" },
      { status: 500 }
    );
  }
}
