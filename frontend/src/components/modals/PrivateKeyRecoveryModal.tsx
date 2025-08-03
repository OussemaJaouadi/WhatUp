import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key, Shield, Download, AlertTriangle, Smartphone } from "lucide-react";
import { useEncryptionSetup } from "@/hooks/useEncryptionSetup";

interface PrivateKeyRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
}

export function PrivateKeyRecoveryModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId, 
  userName 
}: PrivateKeyRecoveryModalProps) {
  const [backupPassword, setBackupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { ensurePrivateKeyAvailable } = useEncryptionSetup();

  const handleRecover = async () => {
    if (!backupPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your backup password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await ensurePrivateKeyAvailable(userId, backupPassword);
      
      if (result.success) {
        toast({
          title: "🔑 Keys Recovered Successfully!",
          description: "Your encryption keys have been restored. You can now access your encrypted messages.",
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Recovery Failed",
          description: result.message || "Failed to recover your encryption keys. Please check your password.",
        });
      }
    } catch (error: any) {
      console.error('Key recovery error:', error);
      toast({
        variant: "destructive",
        title: "Recovery Error",
        description: error.response?.data?.detail || "An unexpected error occurred during key recovery.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Recovery Skipped",
      description: "You can recover your keys later from your profile settings.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Welcome Back from New Device!
          </DialogTitle>
          <DialogDescription>
            Recover your encryption keys to access your secure messages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Hello {userName}! 👋
              </CardTitle>
              <CardDescription>
                We noticed you're signing in from a new device. To access your encrypted messages, 
                please enter your backup password to recover your encryption keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">🔐 What this does:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                  <li>• Restores your private encryption key from backup</li>
                  <li>• Allows you to read your encrypted message history</li>
                  <li>• Enables sending encrypted messages to other users</li>
                  <li>• Securely stores your keys on this device</li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  This is the same password you used when you first set up encryption on your original device.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backupPassword">Backup Password</Label>
              <div className="relative">
                <Input
                  id="backupPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your backup password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleRecover();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleSkip} 
              className="flex-1"
              disabled={isLoading}
            >
              Skip for Now
            </Button>
            <Button 
              onClick={handleRecover} 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Key className="h-4 w-4 mr-2 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Recover Keys
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
