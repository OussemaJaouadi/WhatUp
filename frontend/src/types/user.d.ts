export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  public_key?: string;
  active_avatar_url?: string;
  bio?: string;
  role?: string;
  account_confirmed?: boolean;
  created_at: string;
}

export interface UserResponseAdminDto extends UserResponseDto {
  role: string;
  account_confirmed: boolean;
}