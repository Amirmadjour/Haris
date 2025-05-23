import { NextResponse } from "next/server";
import pool, {
  addChatMessage,
  findUserByUsername,
  getMessageAttachments,
  getTeamMemberByUsername,
  saveAttachment,
} from "@/lib/db";
import db, { getOrCreateChatRoom, getChatMessages } from "@/lib/db";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { sendMentionNotification } from "@/lib/email";
import { broadcastMessage } from "@/lib/chatUtils";

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

    const room: any = getOrCreateChatRoom(alertSerial);
    const messageId: any = addChatMessage(room.id, sender, message, mentions);

    // Get sender's profile image
    const senderProfile: any = findUserByUsername(sender);
    const sender_profile_image = senderProfile?.profile_image || null;

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
      sender_profile_image,
    };

    // Broadcast the message
    broadcastMessage(alertSerial, newMessage);

    // Send email notifications for mentions
    if (mentions.length > 0) {
      const alert: any = getAlert(alertSerial);
      const alertLink = `${process.env.NEXT_PUBLIC_BASE_URL}/alerts/${alertSerial}`;

      for (const username of mentions) {
        try {
          const member: any = getTeamMemberByUsername(username);
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

function getAlert(serial: string) {
  const stmt = db.prepare(
    "SELECT search_name FROM alerts WHERE _serial = ?"
  );
  return stmt.get(serial) || null;
}