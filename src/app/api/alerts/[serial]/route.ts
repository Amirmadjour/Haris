import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: any) {
  try {
      const { serial } = params;

    // MySQL version - using connection pool
    const [rows]: any = await db.query(
      `SELECT 
        a.*,
        CONCAT('100', (SELECT COUNT(*) FROM alerts) - ROW_NUMBER() OVER (ORDER BY trigger_time DESC) + 1) as display_index
      FROM alerts a
      WHERE _serial = ?`,
      [serial]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
