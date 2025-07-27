import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message, WebSocketMessagePayload } from '@/types/message';
import { decryptMessage } from '@/lib/cryptoUtils';
import { keyStorage } from '@/lib/keyStorage';
import { authUtils } from '@/lib/authUtils';

interface MessageContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  handleWebSocketMessage: (payload: WebSocketMessagePayload) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = authUtils.getToken();
    if (token) {
      const decodedToken = authUtils.decodeToken(token);
      if (decodedToken && decodedToken.sub) {
        setCurrentUserId(decodedToken.sub);
      }
    }
  }, []);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleWebSocketMessage = async (payload: WebSocketMessagePayload) => {
    let content = payload.content;
    if (payload.is_encrypted && currentUserId) {
      try {
        const privateKey = await keyStorage.getPrivateKey(currentUserId);
        if (privateKey) {
          content = await decryptMessage(privateKey, payload.content);
        } else {
          console.error("Private key not found for decryption.");
          content = "[Encrypted message - private key not found]";
        }
      } catch (error) {
        console.error("Error decrypting WebSocket message:", error);
        content = "[Encrypted message - decryption failed]";
      }
    }

    const newMessage: Message = {
      id: payload.timestamp + payload.sender_id, // Simple ID for now, backend should provide a real one
      sender_id: payload.sender_id,
      receiver_id: payload.receiver_id,
      conversation_id: payload.conversation_id,
      content: content,
      is_encrypted: payload.is_encrypted,
      timestamp: payload.timestamp,
    };
    addMessage(newMessage);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, setMessages, handleWebSocketMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
