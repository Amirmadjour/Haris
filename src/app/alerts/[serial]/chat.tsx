'use client';

import { useEffect, useRef, useState } from 'react';
import ChatInput from './chat-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AlertChat({ alertSerial }: { alertSerial: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat?alertSerial=${alertSerial}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };
  
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [alertSerial]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (message: string, mentions: string[] = []) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertSerial,
          sender: 'Current User', // Replace with actual user
          message,
          mentions
        }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };
  
  return (
    <Card>
      <CardHeader className="border-b">
        <h2 className="text-lg font-semibold">Alert Discussion</h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet. Start the discussion!</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="mb-4 flex gap-3">
                <Avatar>
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${message.sender}`} />
                  <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{message.sender}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1">
                    {message.message.split(' ').map((word: string, i: number) => {
                      if (word.startsWith('@')) {
                        const username = word.substring(1);
                        return (
                          <span key={i} className="text-blue-600 font-medium">
                            {word}{' '}
                          </span>
                        );
                      }
                      return <span key={i}>{word} </span>;
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4">
          <ChatInput onSend={handleSendMessage} />
        </div>
      </CardContent>
    </Card>
  );
}