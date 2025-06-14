"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "./chat-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

interface AlertChatProps {
  alertSerial: string;
  currentUser: {
    username: string;
    avatar?: string;
  };
}

export default function AlertChat({
  alertSerial,
  currentUser,
}: AlertChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?alertSerial=${alertSerial}`);
      const data = await response.json();
      setMessages(data.messages || []);
      console.log("data.messages: ", data.messages);
    } catch (error) {
      console.error("Failed to fetch messages", error);
      toast.error("Error", { description: "Failed to fetch messages" });
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up SSE connection
    const eventSource = new EventSource(
      `/api/chat/events?alertSerial=${encodeURIComponent(alertSerial)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        // Handle both direct JSON and SSE-formatted messages
        const data = event.data.startsWith("{")
          ? JSON.parse(event.data)
          : JSON.parse(event.data.replace(/^data: /, ""));

        if (data.type === "message") {
          setMessages((prev) => [...prev, data.data]);
          scrollToBottom();
        } else if (data.type === "init") {
          // Handle initialization if needed
        }
      } catch (error) {
        console.error("Error parsing SSE message", error);
      }
    };

    eventSource.onerror = () => {
      console.log("SSE connection error, reconnecting...");
      eventSource.close();
      setTimeout(() => {
        eventSourceRef.current = new EventSource(
          `/api/chat/events?alertSerial=${encodeURIComponent(alertSerial)}`
        );
      }, 1000);
    };

    return () => {
      eventSource.close();
    };
  }, [alertSerial]);

  useEffect(() => {
    fetch("/api/team-members")
      .then((res) => res.json())
      .then(setTeamMembers)
      .catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (
    message: string,
    mentions: string[] = [],
    files: File[] = []
  ) => {
    try {
      const formData = new FormData();
      formData.append("alertSerial", alertSerial);
      formData.append("sender", currentUser.username);
      formData.append("message", message);
      formData.append("mentions", JSON.stringify(mentions));

      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Error", {
        description: "Failed to send message",
      });
    }
  };

  const renderMessageContent = (message: string, attachments: any[] = []) => {
    return (
      <div className="mt-1">
        <p>
          {message.split(" ").map((word: string, i: number) => {
            if (word.startsWith("@")) {
              const username = word.substring(1);
              return (
                <span key={i} className="text-blue-600 font-medium">
                  {word}{" "}
                </span>
              );
            }
            return <span key={i}>{word} </span>;
          })}
        </p>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {attachments.map((attachment, index) => {
              const isImage = attachment.contentType?.startsWith("image/");

              return isImage ? (
                <div key={index} className="max-w-xs">
                  <img
                    src={`/api/chat/attachments/${attachment.id}`}
                    alt={attachment.filename}
                    className="rounded-md max-h-64 object-contain"
                  />
                  <a
                    href={`/api/chat/attachments/${attachment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:underline flex items-center gap-1 mt-1"
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachment.filename}
                  </a>
                </div>
              ) : (
                <a
                  key={index}
                  href={`/api/chat/attachments/${attachment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1"
                >
                  <Paperclip className="h-3 w-3" />
                  {attachment.filename}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-secondary text-white border-border">
      <CardHeader className="border-b flex gap-4 items-center justify-between h-fit py-0">
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src="/team.png" />
            <AvatarFallback>Tr</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 font-poppins">
            <h2 className="text-lg font-semibold">Team members</h2>
            <h2 className="text-sm">
              {teamMembers.map((t, index) =>
                t.name.concat(index + 1 == teamMembers.length ? "." : ", ")
              )}
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className="mb-4 flex gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    `/api/users/${
                      message.sender
                    }/profile-image?t=${Date.now()}` || "/default-user.png"
                  }
                  alt={message.sender}
                />
                <AvatarFallback className="bg-primary">
                  {message?.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{message?.sender}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                {renderMessageContent(message?.message, message?.attachments)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="">
          <ChatInput onSend={handleSendMessage} />
        </div>
      </CardContent>
    </Card>
  );
}
