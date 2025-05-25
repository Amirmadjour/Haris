import { NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import db from "@/lib/db"; // Changed from pool to db
import { existsSync } from "fs";

// route.ts
export async function GET(request: Request, { params }: any) {
  const { username } = params;
  const user: any = db
    .prepare("SELECT profile_image FROM users WHERE username = ?")
    .get(username);

  if (!user?.profile_image) return new NextResponse(null, { status: 404 });

  const filePath = path.join(
    process.cwd(),
    "public",
    user.profile_image.substring(1)
  );
  if (!existsSync(filePath)) return new NextResponse(null, { status: 404 });

  const imageBuffer = await readFile(filePath);
  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/*",
      "Cache-Control": "no-store, max-age=0", // Disable caching
    },
  });
}

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
    const stmt = db.prepare(
      "SELECT profile_image FROM users WHERE username = ?"
    );
    const user: any = stmt.get(username);
    const oldProfileImage = user?.profile_image;

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
    const updateStmt = db.prepare(
      "UPDATE users SET profile_image = ? WHERE username = ?"
    );
    updateStmt.run(`/profiles/${fileName}`, username);

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
