"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function ChatInput({
  onSend,
}: {
  onSend: (message: string, mentions: string[]) => void;
}) {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    const cursorPos = e.target.selectionStart;
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
    if (message.trim()) {
      const mentions = Array.from(message.matchAll(/@(\w+)/g)).map(
        (match) => match[1]
      );
      onSend(message, mentions);
      setMessage("");
    }
  };

  return (
    <div className="flex relative gap-6 px-4">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Message your team member"
        rows={1}
      />
      <div className="flex justify-end">
        <button onClick={handleSend} className="bg-brand p-2 w-fit h-fit rounded-md hover:opacity-90 transition-colors duration-300">
          <Send className="text-white" />
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
  );
}
