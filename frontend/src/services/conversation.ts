import { api } from './api';
import { authUtils } from '@/lib/authUtils';
import { userService } from './user';

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  participant_ids: string[];
  name?: string; // For group chats
}

export const conversationService = {
  createConversation: async (request: CreateConversationRequest) => {
    // Get current user to check if they have keys set up
    const currentUser = await userService.getMe();
    const hasKeys = await authUtils.hasKeysSetup(currentUser.id, currentUser.public_key);
    
    if (!hasKeys) {
      throw new Error('You must set up your encryption keys before starting conversations.');
    }

    // Validate conversation type and participants
    if (request.type === 'direct') {
      if (request.participant_ids.length !== 2) {
        throw new Error('Direct conversations must have exactly 2 participants.');
      }
      
      // For direct conversations, use the existing API format
      const response = await api.post('/conversations/', { 
        user1_id: request.participant_ids[0], 
        user2_id: request.participant_ids[1] 
      });
      return response.data;
    } else if (request.type === 'group') {
      if (request.participant_ids.length < 3) {
        throw new Error('Group conversations must have at least 3 participants.');
      }
      
      if (!request.name || request.name.trim().length === 0) {
        throw new Error('Group conversations must have a name.');
      }
      
      // For group conversations, we'll need to update the backend API
      // For now, throw an error indicating group chats are not yet supported
      throw new Error('Group conversations are not yet supported by the backend API.');
      
      // Future implementation:
      // const response = await api.post('/conversations/group', {
      //   participant_ids: request.participant_ids,
      //   name: request.name.trim()
      // });
      // return response.data;
    } else {
      throw new Error('Invalid conversation type. Must be "direct" or "group".');
    }
  },

  // Legacy method for backward compatibility
  createDirectConversation: async (participantIds: string[]) => {
    return conversationService.createConversation({
      type: 'direct',
      participant_ids: participantIds
    });
  },

  getMyConversations: async () => {
    const response = await api.get('/conversations/my');
    
    // Transform the API response to match our expected format
    const conversations = response.data.map((conv: any) => ({
      id: conv.id,
      created_at: conv.created_at,
      participant_ids: conv.user1_id && conv.user2_id 
        ? [conv.user1_id, conv.user2_id]
        : conv.participant_ids || [],
      name: conv.name || undefined,
      // Keep original fields for debugging
      user1_id: conv.user1_id,
      user2_id: conv.user2_id
    }));
    
    return conversations;
  },
};