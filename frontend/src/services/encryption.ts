// src/services/encryption.ts
import { generateKeyPair, encryptPrivateKey, decryptPrivateKey } from '@/lib/cryptoUtils';
import { keyStorage } from '@/lib/keyStorage';
import { userService } from './user';

export interface EncryptionSetupResult {
  success: boolean;
  isNewSetup: boolean;
  recoveredFromBackup: boolean;
  message: string;
}

export const encryptionService = {
  /**
   * Automatically sets up encryption for a newly registered user
   * Uses their registration password for backup encryption
   */
  setupEncryptionForNewUser: async (userId: string, password: string): Promise<EncryptionSetupResult> => {
    try {
      // Generate new key pair
      const keyPair = await generateKeyPair();
      
      // Store private key locally
      await keyStorage.savePrivateKey(userId, keyPair.privateKey);
      
      // Upload public key to server
      await userService.updatePublicKey(keyPair.publicKey);
      
      // Create encrypted backup using their password
      const encryptedBackup = await encryptPrivateKey(keyPair.privateKey, password);
      await userService.uploadEncryptedPrivateKeyBackup({
        ...encryptedBackup,
        password: password
      });
      
      return {
        success: true,
        isNewSetup: true,
        recoveredFromBackup: false,
        message: "Encryption enabled! Your messages are now secure."
      };
    } catch (error) {
      console.error('Failed to setup encryption for new user:', error);
      return {
        success: false,
        isNewSetup: true,
        recoveredFromBackup: false,
        message: "Failed to enable encryption. You can set it up later in your profile."
      };
    }
  },

  /**
   * Checks if user has a private key locally, and if not, attempts to recover from backup
   */
  ensurePrivateKeyAvailable: async (userId: string, password?: string): Promise<EncryptionSetupResult> => {
    try {
      // First check if we already have the private key locally
      const existingKey = await keyStorage.getPrivateKey(userId);
      if (existingKey) {
        return {
          success: true,
          isNewSetup: false,
          recoveredFromBackup: false,
          message: "Encryption keys ready."
        };
      }

      // If no password provided, we can't recover
      if (!password) {
        return {
          success: false,
          isNewSetup: false,
          recoveredFromBackup: false,
          message: "No encryption keys found. Manual setup required."
        };
      }

      // Try to recover from server backup
      try {
        const backupData = await userService.recoverPrivateKeyBackup(password);
        const decryptedPrivateKey = await decryptPrivateKey(backupData, password);
        
        // Store the recovered key locally
        await keyStorage.savePrivateKey(userId, decryptedPrivateKey);
        
        return {
          success: true,
          isNewSetup: false,
          recoveredFromBackup: true,
          message: "Encryption keys recovered from backup!"
        };
      } catch (backupError) {
        // Backup recovery failed - might be wrong password or no backup exists
        console.log('Backup recovery failed:', backupError);
        return {
          success: false,
          isNewSetup: false,
          recoveredFromBackup: false,
          message: "No backup found or incorrect password. Manual setup required."
        };
      }
    } catch (error) {
      console.error('Error ensuring private key availability:', error);
      return {
        success: false,
        isNewSetup: false,
        recoveredFromBackup: false,
        message: "Error checking encryption status."
      };
    }
  },

  /**
   * Checks if user has encryption properly set up
   */
  isEncryptionSetup: async (userId: string, userPublicKey?: string): Promise<boolean> => {
    try {
      const privateKey = await keyStorage.getPrivateKey(userId);
      
      // If userPublicKey is provided, use it. Otherwise fetch from API.
      let publicKey = userPublicKey;
      if (!publicKey) {
        const userProfile = await userService.getMe();
        publicKey = userProfile.public_key;
      }
      
      return !!(privateKey && publicKey);
    } catch (error) {
      console.error('Error checking encryption setup:', error);
      return false;
    }
  }
};
