// src/hooks/useEncryptionSetup.ts
import { useState, useEffect } from 'react';
import { encryptionService, EncryptionSetupResult } from '@/services/encryption';
import { useToast } from '@/hooks/use-toast';

interface UseEncryptionSetupProps {
  userId?: string;
  userPublicKey?: string;
  autoSetup?: boolean;
}

export function useEncryptionSetup({ userId, userPublicKey, autoSetup = false }: UseEncryptionSetupProps = {}) {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<EncryptionSetupResult | null>(null);
  const { toast } = useToast();

  const setupEncryptionForNewUser = async (userIdParam: string, password: string) => {
    const targetUserId = userIdParam || userId;
    if (!targetUserId) {
      console.error('User ID is required for encryption setup');
      return;
    }

    setIsLoading(true);
    try {
      const result = await encryptionService.setupEncryptionForNewUser(targetUserId, password);
      setSetupResult(result);
      setIsSetupComplete(result.success);

      if (result.success) {
        toast({
          title: "🔐 Encryption Enabled",
          description: result.message,
          className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Setup Failed",
          description: result.message,
          className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
        });
      }

      return result;
    } catch (error) {
      console.error('Encryption setup error:', error);
      toast({
        variant: "destructive",
        title: "Setup Error",
        description: "An unexpected error occurred during encryption setup.",
        className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ensurePrivateKeyAvailable = async (userId: string, password?: string) => {
    if (!userId) {
      console.error('User ID is required for key recovery');
      return;
    }

    setIsLoading(true);
    try {
      const result = await encryptionService.ensurePrivateKeyAvailable(userId, password);
      setSetupResult(result);
      setIsSetupComplete(result.success);

      if (result.recoveredFromBackup) {
        toast({
          title: "🔑 Keys Recovered",
          description: result.message,
          className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
        });
      } else if (!result.success) {
        // Only show error for non-silent failures
        if (password) {
          toast({
            variant: "destructive",
            title: "Recovery Failed",
            description: result.message,
            className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Key recovery error:', error);
      toast({
        variant: "destructive",
        title: "Recovery Error", 
        description: "An unexpected error occurred during key recovery.",
        className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEncryptionStatus = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const isSetup = await encryptionService.isEncryptionSetup(userId, userPublicKey);
      setIsSetupComplete(isSetup);
    } catch (error) {
      console.error('Error checking encryption status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check encryption status when userId changes
  useEffect(() => {
    if (userId && autoSetup) {
      checkEncryptionStatus();
    }
  }, [userId, userPublicKey, autoSetup]);

  return {
    isSetupComplete,
    isLoading,
    setupResult,
    setupEncryptionForNewUser,
    ensurePrivateKeyAvailable,
    checkEncryptionStatus,
  };
}
