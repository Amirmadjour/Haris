// lib/auth.ts
import { findUserByUsername, updateLastLogin } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function verifyCredentials(username: string, password: string) {
  const user: any = findUserByUsername(username);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;

  // Update last login
  updateLastLogin(user.id);
  
  return user;
}