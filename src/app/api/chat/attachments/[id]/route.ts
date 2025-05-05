// app/api/chat/attachments/[id]/route.ts
import { NextResponse } from "next/server";
import { getAttachmentInfo } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    // Get attachment info from database
    const attachment: any = getAttachmentInfo(id);
    if (!attachment) {
      return new NextResponse(null, { status: 404 });
    }

    const file = fs.readFileSync(attachment.filepath);
    const stats = fs.statSync(attachment.filepath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": attachment.content_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${attachment.filename}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving attachment:", error);
    return new NextResponse(null, { status: 500 });
  }
}
