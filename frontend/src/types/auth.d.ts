export interface TokenPayload {
  sub: string; // User ID
  role: string; // User role (e.g., 'admin', 'user')
  exp?: number; // Expiration timestamp
}

export type DecodedToken = TokenPayload;

export interface TokenData {
  access_token: string;
}

export interface ConfirmationTokenPayload {
  sub?: string;
  email: string;
  exp?: number;
  type: string; // To differentiate between account_confirmation and password_reset
}