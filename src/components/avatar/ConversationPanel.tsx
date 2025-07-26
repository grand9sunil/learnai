"use client";

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  conversation: ConversationMessage[];
}

export default function ConversationPanel({ conversation }: ConversationPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversation]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (conversation.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-center p-8">
        <div className="space-y-2">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium">Welcome to AI Tutor!</p>
          <p className="text-sm text-muted-foreground">
            Start a conversation by typing a message or using voice input
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64 w-full" ref={scrollAreaRef}>
      <div className="space-y-4 p-4">
        {conversation.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[80%]",
              message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={cn(
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            
            <div className={cn(
              "space-y-1",
              message.role === 'user' ? "text-right" : "text-left"
            )}>
              <div className={cn(
                "rounded-lg px-3 py-2 text-sm",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {message.content}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}