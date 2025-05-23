// lib/auth.ts
import bcrypt from "bcryptjs";
import { findUserByUsername, updateLastLogin } from "@/lib/db";

export function verifyCredentials(username: string, password: string) {
  const user: any = findUserByUsername(username);
  console.log("user: ", user);
  if (!user) return null;

  const passwordMatch = bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) return null;

  updateLastLogin(user.id);
  return user;
}
