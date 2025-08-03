import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateKeyPair, encryptPrivateKey } from "@/lib/cryptoUtils";
import { keyStorage } from "@/lib/keyStorage";
import { userService } from "@/services/user";
import { authUtils } from "@/lib/authUtils";
import { Eye, EyeOff, Key, Shield, Download, AlertTriangle } from "lucide-react";

interface KeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function KeySetupModal({ isOpen, onClose, onComplete }: KeySetupModalProps) {
  const [step, setStep] = useState<'intro' | 'password' | 'generating' | 'backup' | 'complete'>('intro');
  const [backupPassword, setBackupPassword] = useState('');
  const [confirmBackupPassword, setConfirmBackupPassword] = useState('');
  const [showBackupPassword, setShowBackupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<string>('');
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setBackupPassword('');
      setConfirmBackupPassword('');
      setShowBackupPassword(false);
      setShowConfirmPassword(false);
      setIsGenerating(false);
      setKeyPair(null);
      setEncryptedPrivateKey('');
    }
  }, [isOpen]);

  const handlePasswordChoice = () => {
    if (backupPassword !== confirmBackupPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Please ensure both passwords match.",
      });
      return;
    }

    if (backupPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Backup password must be at least 8 characters long.",
      });
      return;
    }

    setStep('generating');
    generateKeys();
  };

  const generateKeys = async () => {
    setIsGenerating(true);
    try {
      // Generate the key pair
      const newKeyPair = await generateKeyPair();
      setKeyPair(newKeyPair);

      // Get user info to use their ID and password
      const userInfo = await userService.getMe();
      const password = backupPassword;

      if (!password) {
        throw new Error("Password not available");
      }

      // Encrypt the private key
      const encryptedKey = await encryptPrivateKey(newKeyPair.privateKey, password);
      setEncryptedPrivateKey(JSON.stringify(encryptedKey));

      // Store the private key locally
      await keyStorage.savePrivateKey(userInfo.id, newKeyPair.privateKey);

      // Upload the public key to the server
      await userService.updatePublicKey(newKeyPair.publicKey);

      // Upload the encrypted private key backup to the server
      await userService.uploadEncryptedPrivateKeyBackup({
        encrypted_private_key: encryptedKey.encrypted_private_key,
        salt: encryptedKey.salt,
        iv: encryptedKey.iv,
        password: password
      });

      // Clean up the stored login password
      authUtils.removeTempLoginPassword();

      toast({
        title: "Keys Generated Successfully! 🔐",
        description: "Your encryption keys have been created and secured.",
      });

      setStep('backup');
    } catch (error: any) {
      console.error('Key generation error:', error);
      toast({
        variant: "destructive",
        title: "Key Generation Failed",
        description: error.message || "Failed to generate encryption keys. Please try again.",
      });
      setStep('password');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBackup = () => {
    if (!keyPair || !encryptedPrivateKey) return;

    // Parse the encrypted key data that was stored as JSON
    const encryptedKeyData = JSON.parse(encryptedPrivateKey);
    
    const backupData = {
      encrypted_private_key: encryptedKeyData.encrypted_private_key,
      salt: encryptedKeyData.salt,
      iv: encryptedKeyData.iv,
      public_key: keyPair.publicKey,
      created_at: new Date().toISOString(),
      backup_type: 'custom_password',
      note: 'This backup is encrypted with your custom backup password. You will need this specific password to decrypt.'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatup-keys-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Downloaded! 💾",
      description: "Keep this file safe - you'll need it to recover your account on other devices.",
    });
  };

  const completeSetup = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  const resetModal = () => {
    setStep('intro');
    setBackupPassword('');
    setConfirmBackupPassword('');
    setKeyPair(null);
    setEncryptedPrivateKey('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Secure Your Account
          </DialogTitle>
          <DialogDescription>
            Set up end-to-end encryption for your messages
          </DialogDescription>
        </DialogHeader>

        {step === 'intro' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Welcome! Let's Secure Your Account
                </CardTitle>
                <CardDescription>
                  As a new user, we'll set up end-to-end encryption to keep your messages private and secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">🔐 What we'll do:</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                    <li>• Generate unique encryption keys for your account</li>
                    <li>• Choose a password to protect your private key</li>
                    <li>• Store keys securely on your device and server</li>
                    <li>• Enable encrypted messaging with other users</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />
                    This step is required to send and receive encrypted messages. You can use your login password or create a custom backup password.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={() => setStep('password')} className="flex-1">
                Continue Setup
              </Button>
            </div>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Create Your Backup Password</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create a secure password to protect your encryption keys. This password will be used to encrypt your private key.
              </p>

              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Secure Backup Password
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Choose a strong password that you'll remember. You'll need this password to decrypt your keys on other devices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupPassword">Backup Password</Label>
                  <div className="relative">
                    <Input
                      id="backupPassword"
                      type={showBackupPassword ? "text" : "password"}
                      placeholder="Create a strong backup password"
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowBackupPassword(!showBackupPassword)}
                    >
                      {showBackupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmBackupPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmBackupPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your backup password"
                      value={confirmBackupPassword}
                      onChange={(e) => setConfirmBackupPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePasswordChoice} className="flex-1">
                Generate Keys
              </Button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Key className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Generating Your Keys...</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Creating secure encryption keys for your account
                </p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Keys Generated Successfully!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your encryption keys are ready and secured with your custom backup password.
                </p>
              </div>
            </div>

            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                      Download Backup (Recommended)
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Save an encrypted backup of your keys. You'll need this if you ever need to recover your account on another device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={completeSetup} className="flex-1">
                Skip Backup
              </Button>
              <Button onClick={downloadBackup} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download & Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Setup Complete! 🎉</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your account is now secured with end-to-end encryption.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
