// app/actions/auth.ts
"use server";

import { verifyCredentials } from "@/lib/auth";
import { cookies } from "next/headers";

export async function signInAction(username: string, password: string) {
  const user = await verifyCredentials(username, password);
  if (!user) return null;

  // Stringify the user object before storing in cookie
  const userString = JSON.stringify(user);
  
  (await cookies()).set("auth-token", userString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week expiry
  });
  
  return user;
}

export async function signOutAction() {
  (await cookies()).delete("auth-token");
}

export async function getCurrentUserAction() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return null;
  
  try {
    // Parse the stored user data
    return JSON.parse(token);
  } catch (error) {
    console.error("Failed to parse user data from cookie:", error);
    return null;
  }
}