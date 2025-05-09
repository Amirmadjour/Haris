// app/api/chat/attachments/[id]/route.ts
import { NextResponse } from "next/server";
import { getAttachmentInfo } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(request: Request, { params }: any) {
  const { id } = params;
  try {
    const attachment: any = getAttachmentInfo(id);
    if (!attachment) {
      return new NextResponse(null, { status: 404 });
    }

    const file: any = fs.readFileSync(attachment.filepath);
    const stats = fs.statSync(attachment.filepath);

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
