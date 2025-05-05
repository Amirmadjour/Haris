"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Paperclip, Send, SendHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ChatInput({
  onSend,
}: {
  onSend: (message: string, mentions: string[], files?: File[]) => void;
}) {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/team-members")
      .then((res) => res.json())
      .then(setTeamMembers)
      .catch(console.error);
  }, []);

  const filteredMembers = mentionQuery
    ? teamMembers.filter((member) =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : teamMembers;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    const cursorPos = e.target.selectionStart as number | undefined;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (
      lastAtPos >= 0 &&
      (cursorPos === lastAtPos + 1 ||
        /^[\w\s]$/.test(textBeforeCursor[lastAtPos + 1]))
    ) {
      const query = textBeforeCursor.substring(lastAtPos + 1);
      setMentionQuery(query);
      setMentionPosition(lastAtPos);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    const beforeMention = message.substring(0, mentionPosition);
    const afterMention = message.substring(
      mentionPosition + mentionQuery.length + 1
    );
    setMessage(`${beforeMention}@${username} ${afterMention}`);
    setShowMentions(false);
    setMentionQuery("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() || files.length > 0) {
      const mentions = Array.from(message.matchAll(/@(\w+)/g)).map(
        (match) => match[1]
      );
      onSend(message, mentions, files);
      setMessage("");
      setFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (files.length > 1) {
      toast.info("Max number of upload files reached", {
        description: "You can only upload 2 files per message",
      });
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newFiles.length === 0) {
        toast.error("Only image files are allowed");
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    if (files.length > 1) {
      toast.info("Max number of upload files reached", {
        description: "You can only upload 2 files per message",
      });
      return;
    }
    if (e.clipboardData.files.length > 0) {
      const newFiles = Array.from(e.clipboardData.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newFiles.length === 0) {
        toast.error("Only image files are allowed");
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (files.length > 1) {
      toast.info("Max number of upload files reached", {
        description: "You can only upload 2 files per message",
      });
      return;
    }

    if (e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (newFiles.length === 0) {
        toast.error("Only image files are allowed");
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  return (
    <div
      className="flex flex-col relative gap-4 px-4 items-center"
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {files.length > 0 && (
        <div className="w-full flex gap-2 overflow-x-auto py-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-800 rounded-md px-3 py-2 text-sm"
            >
              <Paperclip className="text-white h-4 w-4" />
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full relative gap-4 items-center">
        <Input
          ref={textareaRef}
          className={`bg-border py-3 pl-12 h-fit ${
            isDragging ? "border-2 border-dashed border-blue-500" : ""
          }`}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message your team member"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-white absolute left-4 top-3"
        >
          <Paperclip />
        </button>
        <Camera className="text-white absolute right-18 top-3" />
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            className="bg-brand p-2.5 w-fit h-fit rounded-md hover:opacity-90 transition-colors duration-300"
          >
            <SendHorizontal className="text-black" />
          </button>
        </div>

        {showMentions && (
          <div
            className="absolute bottom-16 left-0 bg-primary border rounded-lg shadow-lg z-10 w-48 max-h-60 overflow-y-auto"
            style={{ top: "auto" }}
          >
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-2 hover:bg-gray-900 cursor-pointer"
                onClick={() => handleMentionSelect(member.name)}
              >
                {member.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}