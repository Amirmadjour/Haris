// app/actions/auth.ts
"use server";

import { verifyCredentials } from "@/lib/auth";
import { findUserByUsername, createSession, validateSession, deleteSession, deleteAllUserSessions } from "@/lib/db";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

export async function signInAction(username: string, password: string) {
  const user = await verifyCredentials(username, password);
  if (!user) return null;

  // Create session
  const sessionId = uuidv4();
  const expiresAt = Date.now() + 60 * 60 * 24 * 7 * 1000; // 1 week
  
  // Store session in database
  createSession(user.id, sessionId, expiresAt);

  // Set secure cookie with session ID only
  (await cookies()).set("auth-token", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return user;
}

export async function signOutAction() {
  const sessionId = (await cookies()).get("auth-token")?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }
  (await cookies()).delete("auth-token");
}

export async function getCurrentUserAction() {
  const sessionId = (await cookies()).get("auth-token")?.value;
  if (!sessionId) return null;
  
  // Validate session against database
  const user = validateSession(sessionId);
  if (!user) {
    // Clean up invalid session
    (await cookies()).delete("auth-token");
    return null;
  }
  
  return user;
}

export async function getCurrentUserProfile(username: string) {
  const user: any = findUserByUsername(username);
  if (!user) {
    // User deleted - clean up all their sessions
    deleteAllUserSessions(user.id);
    return null;
  }
  
  return {
    profile_image: user?.profile_image || null,
  };
}