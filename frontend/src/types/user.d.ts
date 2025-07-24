import { UUID } from 'crypto';

export interface UserResponseDto {
  id: UUID;
  username: string;
  email: string;
  active_avatar_url?: string;
  public_key?: string;
  created_at: string;
  accountConfirmed?: boolean;
}

export interface UserResponseAdminDto extends UserResponseDto {
  role: "admin" | "user";
}