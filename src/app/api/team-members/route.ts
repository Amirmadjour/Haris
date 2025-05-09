// app/api/team-members/route.ts
import { NextResponse } from "next/server";
import { getTeamMembers } from "@/lib/db";

export async function GET() {
  const members = await getTeamMembers();
  return NextResponse.json(members);
}
