// app/api/chat/attachments/[id]/route.ts
import { NextResponse } from "next/server";
import { getAttachmentInfo } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(request: Request, { params }: any) {
  const { id } = params;
  try {
    const attachment: any = await getAttachmentInfo(id);
    if (!attachment) {
      return new NextResponse(null, { status: 404 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullPath = path.join(uploadsDir, attachment.filepath);

    // 2. Security checks
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(uploadsDir)) {
      return new NextResponse("Invalid file path", { status: 403 });
    }

    console.log("fullpath: ", fullPath)

    const file: any = fs.readFileSync(fullPath);
    const stats = fs.statSync(fullPath);

    // Check if the file is an image
    const isImage = attachment.content_type?.startsWith("image/");

    return new NextResponse(file, {
      headers: {
        "Content-Type": attachment.content_type || "application/octet-stream",
        // Display inline for images, force download for other types
        "Content-Disposition": isImage
          ? `inline; filename="${attachment.filename}"`
          : `attachment; filename="${attachment.filename}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving attachment:", error);
    return new NextResponse(null, { status: 500 });
  }
}
