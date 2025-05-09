import { NextResponse } from "next/server";
import { addChatMessage, getMessageAttachments, saveAttachment } from "@/lib/db";
import { getOrCreateChatRoom, getChatMessages } from "@/lib/db";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  const alertSerial = request.nextUrl.searchParams.get("alertSerial");

  if (!alertSerial) {
    return NextResponse.json(
      { error: "Alert serial is required" },
      { status: 400 }
    );
  }

  try {
    const room: any = getOrCreateChatRoom(alertSerial);
    const messages = getChatMessages(room.id);
     // Enhance messages with their attachments
    const messagesWithAttachments = messages.map((message: any) => {
      const attachments = getMessageAttachments(message.id);
      return {
        ...message,
        attachments: attachments.map((attachment: any) => ({
          id: attachment.id,
          filename: attachment.filename,
          contentType: attachment.content_type,
          size: attachment.size
        }))
      };
    });

    return NextResponse.json({ messages: messagesWithAttachments });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const alertSerial = formData.get("alertSerial") as string;
    const sender = formData.get("sender") as string;
    const message = formData.get("message") as string;
    const mentions = JSON.parse((formData.get("mentions") as string) || "[]");

    if (!alertSerial || !sender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const room: any = getOrCreateChatRoom(alertSerial);
    const messageId = addChatMessage(room.id, sender, message, mentions);

    // Handle file attachments
    const attachments = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        const file = value;
        const attachmentId = await saveAttachment(room.id, messageId, file);
        attachments.push({
          id: attachmentId,
          filename: file.name,
          contentType: file.type,
        });
      }
    }

    return NextResponse.json({ success: true, attachments });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}