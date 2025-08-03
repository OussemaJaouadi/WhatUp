// src/components/EncryptionSetupBanner.tsx
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Key, X, Lock } from 'lucide-react';
import { useEncryptionSetup } from '@/hooks/useEncryptionSetup';
import { KeySetupModal } from '@/components/modals/KeySetupModal';

interface EncryptionSetupBannerProps {
  userId: string;
  userHasPublicKey: boolean;
  userPublicKey?: string;
}

export function EncryptionSetupBanner({ userId, userHasPublicKey, userPublicKey }: EncryptionSetupBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { isSetupComplete, checkEncryptionStatus } = useEncryptionSetup({ 
    userId, 
    userPublicKey, 
    autoSetup: true 
  });

  useEffect(() => {
    const checkSetup = async () => {
      if (!userHasPublicKey) {
        setIsVisible(true);
        return;
      }

      await checkEncryptionStatus();
      if (!isSetupComplete) {
        setIsVisible(true);
      }
    };

    checkSetup();
  }, [userId, userHasPublicKey, isSetupComplete, checkEncryptionStatus]);

  const handleSetupClick = () => {
    setShowSetupModal(true);
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to avoid showing again for this session
    localStorage.setItem(`encryption-setup-dismissed-${userId}`, 'true');
  };

  if (!isVisible || isSetupComplete) {
    return null;
  }

  return (
    <>
      <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Secure messaging not enabled
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set up encryption to send secure messages
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleSetupClick}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Key className="h-4 w-4 mr-2" />
              Enable Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 border-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>

      <KeySetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onComplete={handleSetupComplete}
      />
    </>
  );
}
