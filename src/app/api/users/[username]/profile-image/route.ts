import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import pool from "@/lib/db";
import { existsSync } from "fs";

export async function POST(request: Request, { params }: any) {
  try {
    const { username } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Get the old profile image path
    const [userRows]: any = await pool.query(
      "SELECT profile_image FROM users WHERE username = ?",
      [username]
    );
    const oldProfileImage = userRows[0]?.profile_image;

    // Generate new file name and path
    const fileExt = path.extname(file.name);
    const fileName = `profile-${username}${fileExt}`;
    const filePath = path.join(process.cwd(), "public", "profiles", fileName);

    // Delete old image if it exists
    if (oldProfileImage) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        oldProfileImage.substring(1) // Remove leading slash
      );
      
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    // Save new file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with new image path
    await pool.query(
      "UPDATE users SET profile_image = ? WHERE username = ?",
      [`/profiles/${fileName}`, username]
    );

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