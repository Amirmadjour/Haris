// lib/auth.ts
import bcrypt from "bcryptjs";
import { findUserByUsername, updateLastLogin } from "@/lib/db";

export async function verifyCredentials(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) return null;

  await updateLastLogin(user.id);
  return user;
}