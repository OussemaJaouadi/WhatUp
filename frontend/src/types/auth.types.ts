export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  role: string;
  user_id: string;
}