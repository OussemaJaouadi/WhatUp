import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { keyStorage } from "@/lib/keyStorage";
import * as cryptoUtils from "@/lib/cryptoUtils";
import { userService } from "@/services/user";

interface AutoBackupModalProps {
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AutoBackupModal = ({ currentUserId, isOpen, onClose }: AutoBackupModalProps) => {
  const { toast } = useToast();
  const [backupPassword, setBackupPassword] = useState("");

  const handleBackupPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no password provided, suggest using account password
    if (!backupPassword) {
      toast({
        title: "Backup Password Needed", 
        description: "Please enter your account password or a different backup password to secure your private key.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const privateKey = await keyStorage.getPrivateKey(currentUserId);
      if (!privateKey) {
        toast({
          title: "No Private Key Found",
          description: "Please generate your keys first.",
          variant: "destructive",
        });
        return;
      }
      const encryptedData = await cryptoUtils.encryptPrivateKey(privateKey, backupPassword);
      await userService.uploadEncryptedPrivateKeyBackup(encryptedData);
      toast({
        title: "Private Key Backed Up",
        description: "Your private key has been securely backed up to the server.",
      });
      setBackupPassword("");
      onClose();
    } catch (error) {
      console.error("Error backing up private key:", error);
      toast({
        title: "Backup Failed",
        description: error.response?.data?.detail || "An error occurred during private key backup.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setBackupPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
                <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Secure Your Private Key</h2>
          <p className="text-sm text-muted-foreground">
            Your encryption keys have been generated! For security, we'll create a backup of your private key. 
            By default, we use your account password for encryption, or you can set a different backup password.
          </p>
        </div>
        <form onSubmit={handleBackupPrivateKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auto-backup-password">Backup Password</Label>
            <Input
              id="auto-backup-password"
              type="password"
              placeholder="Enter your account password or a different backup password"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use your account password for convenience, or enter a different password for extra security.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Skip for Now
            </Button>
            <Button type="submit" className="btn-primary">
              Backup Private Key
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
