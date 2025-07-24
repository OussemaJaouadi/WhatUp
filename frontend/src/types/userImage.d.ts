import { UUID } from 'crypto';

export interface UserImageResponseDto {
  id: UUID;
  user_id: UUID;
  image_key: string;
  is_active: boolean;
  created_at: string;
}