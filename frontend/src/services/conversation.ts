import { api } from './api';

export const conversationService = {
  createConversation: async (participantIds: string[]) => {
    const response = await api.post('/conversations/', { 
      user1_id: participantIds[0], 
      user2_id: participantIds[1] 
    });
    return response.data;
  },

  getMyConversations: async () => {
    const response = await api.get('/conversations/my');
    return response.data;
  },
};