import { api } from './api';

export const conversationService = {
  createConversation: async (participant_ids: string[]) => {
    const response = await api.post('/conversations/', { participant_ids });
    return response.data;
  },

  getMyConversations: async () => {
    const response = await api.get('/conversations/my');
    return response.data;
  },
};