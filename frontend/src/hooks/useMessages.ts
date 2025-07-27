import { useEffect, useState } from "react";
import { websocketService } from "@/services/websocket";
import { ChatMessagePayload, WebSocketMessagePayload } from "@/types/message";

interface UseMessagesOptions {
  userId: string;
}

export function useMessages({ userId }: UseMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);

  useEffect(() => {
    websocketService.connect(userId);

    websocketService.onMessage((message: WebSocketMessagePayload) => {
      if (message.type === "chat_message") {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, [userId]);

  const sendMessage = (message: WebSocketMessagePayload) => {
    websocketService.sendMessage(message);
  };

  return { messages, sendMessage };
}
