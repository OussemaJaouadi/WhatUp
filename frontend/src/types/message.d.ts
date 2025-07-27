export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  conversation_id: string;
  content: string;
  is_encrypted: boolean;
  timestamp: string;
}

export interface ChatMessagePayload {
  type: "chat_message";
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  content: string;
  is_encrypted: boolean;
  timestamp: string;
}

export interface TypingMessagePayload {
  type: "typing";
  conversation_id: string;
  user_id: string;
}

export type WebSocketMessagePayload = ChatMessagePayload | TypingMessagePayload;