import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../types/auth.types';
import { keyStorage } from './keyStorage';

const TOKEN_KEY = "jwt_token";
const LOGIN_PASSWORD_KEY = "temp_login_password";

export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    // Also remove the temporary password when removing token
    localStorage.removeItem(LOGIN_PASSWORD_KEY);
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

  // Temporarily store login password for key generation (should be removed after use)
  setTempLoginPassword: (password: string) => {
    localStorage.setItem(LOGIN_PASSWORD_KEY, password);
  },

  getStoredLoginPassword: (): string | null => {
    return localStorage.getItem(LOGIN_PASSWORD_KEY);
  },

  removeTempLoginPassword: () => {
    localStorage.removeItem(LOGIN_PASSWORD_KEY);
  },

  // Check if user has both public and private keys set up
  hasKeysSetup: async (userId: string, userPublicKey?: string | null): Promise<boolean> => {
    try {
      // Check if user has public key
      if (!userPublicKey) {
        return false;
      }
      
      // Check if user has private key stored locally
      const privateKey = await keyStorage.getPrivateKey(userId);
      return !!privateKey;
    } catch (error) {
      console.error("Error checking key setup:", error);
      return false;
    }
  },
};