import { NextResponse } from "next/server";
import pool, {
  addChatMessage,
  getMessageAttachments,
  getTeamMemberByUsername,
  saveAttachment,
} from "@/lib/db";
import { getOrCreateChatRoom, getChatMessages } from "@/lib/db";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { sendMentionNotification } from "@/lib/email";
import { broadcastMessage } from "./events/route";

export async function GET(request: NextRequest) {
  const alertSerial = request.nextUrl.searchParams.get("alertSerial");

  if (!alertSerial) {
    return NextResponse.json(
      { error: "Alert serial is required" },
      { status: 400 }
    );
  }

  try {
    const room: any = await getOrCreateChatRoom(alertSerial);
    const messages: any = await getChatMessages(room.id);

    const messagesWithAttachments = await Promise.all(
      messages.map(async (message: any) => {
        try {
          const attachments: any = await getMessageAttachments(message.id);
          return {
            ...message,
            attachments: attachments.map((attachment: any) => ({
              id: attachment.id,
              filename: attachment.filename,
              contentType: attachment.content_type,
              size: attachment.size,
            })),
          };
        } catch (error) {
          console.error(
            `Failed to load attachments for message ${message.id}`,
            error
          );
          return { ...message, attachments: [] };
        }
      })
    );

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

    const room: any = await getOrCreateChatRoom(alertSerial);
    const messageId = await addChatMessage(room.id, sender, message, mentions);

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

    // Broadcast to all clients listening to this alertSerial
    const newMessage = {
      id: messageId,
      sender,
      message,
      attachments,
      created_at: new Date().toISOString(),
    };

    // Broadcast the message
    broadcastMessage(alertSerial, newMessage);

    // Send email notifications for mentions
    if (mentions.length > 0) {
      const alert = await getAlert(alertSerial);
      const alertLink = `${process.env.NEXT_PUBLIC_BASE_URL}/alerts/${alertSerial}`;

      for (const username of mentions) {
        try {
          const member = await getTeamMemberByUsername(username);
          if (member && member.email) {
            await sendMentionNotification(
              member.email,
              sender,
              alert?.search_name || alertSerial,
              message,
              alertLink
            );
          }
        } catch (error) {
          console.error(`Failed to notify ${username}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, messageId, attachments });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

async function getAlert(serial: string) {
  const [rows]: any = await pool.query(
    "SELECT search_name FROM alerts WHERE _serial = ?",
    [serial]
  );
  return rows[0] || null;
}
