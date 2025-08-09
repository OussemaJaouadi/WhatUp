export interface ConversationResponseDto {
  id: string;
  participant_ids: string[];
  created_at: string;
  // Backend fields (for transformation)
  user1_id?: string;
  user2_id?: string;
  name?: string; // For group chats
}