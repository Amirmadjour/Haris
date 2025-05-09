import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: any) {
  const alert = db
    .prepare("SELECT * FROM alerts WHERE _serial = ?")
    .get(params.serial);

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json(alert);
}
