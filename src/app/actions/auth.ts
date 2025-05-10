// app/actions/auth.ts
"use server";

import { verifyCredentials } from "@/lib/auth";
import { cookies } from "next/headers";

export async function signInAction(username: string, password: string) {
  const user = await verifyCredentials(username, password);
  if (!user) return null;

  (await cookies()).set("auth-token", user.username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  
  return user;
}

export async function signOutAction() {
  (await cookies()).delete("auth-token");
}

export async function getCurrentUserAction() {
  const token = (await cookies()).get("auth-token")?.value;
  return token ? { username: token } : null;
}