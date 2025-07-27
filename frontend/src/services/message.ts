import { api } from './api';

export const messageService = {
  sendMessage: async (sender_id: string, receiver_id: string, conversation_id: string, content: string, is_encrypted: boolean) => {
    const response = await api.post('/messages/send', {
      sender_id,
      receiver_id,
      conversation_id,
      content,
      is_encrypted,
    });
    return response.data;
  },

  getConversationMessages: async (conversation_id: string) => {
    const response = await api.get(`/messages/conversation/${conversation_id}`);
    return response.data;
  },
};