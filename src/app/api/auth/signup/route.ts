// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    await createUser(username, email, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 400 }
    );
  }
}
