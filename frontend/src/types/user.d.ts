export type UserRole = "admin" | "user";

export interface UserBase {
  username: string;
  email: string;
  bio?: string | null;
}

export interface UserCreate extends UserBase {
  password?: string;
}

export interface UserInDBBase extends UserBase {
  id: string;
  created_at: string;
  role: UserRole;
  active_avatar_url?: string | null;
  public_key?: string | null;
}

export type User = UserInDBBase;

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  active_avatar_url?: string | null;
  public_key?: string | null;
  bio?: string | null;
  created_at: string;
  account_confirmed: boolean;
}

export interface UserResponseAdminDto extends UserResponseDto {
  role: UserRole;
}

export interface UserResponseAdminListDto {
  id: string;
  username: string;
  email: string;
  active_avatar_url?: string | null;
  public_key?: string | null;
  created_at: string;
  role: UserRole;
}

export interface UserSearchResponseDto {
  id: string;
  username: string;
  public_key?: string | null;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface UserUpdatePublicKey {
  public_key: string;
}

export interface UserLogin {
  username: string;
  password?: string;
}

export interface UserAdminEdit {
  role?: UserRole;
  account_confirmed?: boolean;
  bio?: string | null;
  file?: File;
}

export interface UserUpdateDto {
  bio?: string | null;
}