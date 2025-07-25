import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

const TOKEN_KEY = "jwt_token";

export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  decodeToken: (token: string): DecodedToken | null => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  getUserRole: (): string | null => {
    const token = authUtils.getToken();
    if (token) {
      const decodedToken = authUtils.decodeToken(token);
      return decodedToken?.role || null;
    }
    return null;
  },
};
