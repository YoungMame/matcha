"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import Button from "@/components/common/Button";
import TextField from "@/components/common/TextField";
import MessageBubble from "@/components/browsing/MessageBubble";
import { Message } from "@/types/message";

interface ChatInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    pictureUrl: string;
  };
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (content: string) => void;
}

export default function ChatInterface({
  otherUser,
  messages,
  currentUserId,
  onSendMessage,
}: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage?.(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
	if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Stack
      direction="column"
      className="flex-1 h-full bg-white dark:bg-gray-800"
    >
      {/* Chat Header */}
      <Stack
        direction="row"
        align="center"
        spacing="sm"
        className="p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={otherUser.pictureUrl}
            alt={otherUser.name}
            fill
            className="object-cover"
          />
        </div>
        <Typography variant="body" className="font-semibold">
          {otherUser.name}
        </Typography>
      </Stack>

      {/* Messages List */}
      <Stack
        direction="column"
        spacing="md"
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <Stack
            direction="column"
            align="center"
            justify="center"
            className="h-full"
          >
            <Typography color="secondary">
              Aucun message pour le moment. Commencez la conversation !
            </Typography>
          </Stack>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <Stack
                key={message.id}
                direction="row"
                justify={isCurrentUser ? "end" : "start"}
              >
                <MessageBubble
                  content={message.content}
                  timestamp={message.timestamp}
                  isCurrentUser={isCurrentUser}
                />
              </Stack>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Stack>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Stack direction="row" spacing="sm">
          <TextField
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Écrivez un message..."
            fullWidth
            className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            variant="primary"
            size="medium"
          >
            Envoyer
          </Button>
        </Stack>
      </div>
    </Stack>
  );
}
