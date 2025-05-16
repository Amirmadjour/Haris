import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import pool from "@/lib/db";

export async function POST(request: Request, { params }: any) {
  try {
    const { username } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name);
    const fileName = `profile-${username}${fileExt}`;
    const filePath = path.join(process.cwd(), "public", "profiles", fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    await pool.query(`UPDATE users SET profile_image = ? WHERE username = ?`, [
      `/profiles/${fileName}`,
      username,
    ]);

    return NextResponse.json({
      success: true,
      imageUrl: `/profiles/${fileName}`,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { success: false, message: "Profile image upload failed" },
      { status: 500 }
    );
  }
}
