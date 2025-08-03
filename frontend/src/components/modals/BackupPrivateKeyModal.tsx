import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { keyStorage } from "@/lib/keyStorage";
import * as cryptoUtils from "@/lib/cryptoUtils";
import { userService } from "@/services/user";

interface BackupPrivateKeyModalProps {
  currentUserId: string;
}

export const BackupPrivateKeyModal = ({ currentUserId }: BackupPrivateKeyModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");

  const handleBackupPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupPassword) {
      toast({
        title: "Password Required",
        description: "Please enter a password to encrypt your private key.",
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
        description: "Your private key has been securely backed up.",
      });
      setBackupPassword("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error backing up private key:", error);
      toast({
        title: "Backup Failed",
        description: error.response?.data?.detail || "An error occurred during private key backup.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Upload className="h-4 w-4 mr-2" />
          Backup Private Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Backup Private Key</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a password to encrypt your private key before backing it up to the server. 
          You can use your account password or choose a different one for extra security.
        </p>
        <form onSubmit={handleBackupPrivateKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-modal-password">Backup Password</Label>
            <Input
              id="backup-modal-password"
              type="password"
              placeholder="Enter your account password or a different backup password"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              For convenience, use your account password. For extra security, use a different password.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                setBackupPassword("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              <Upload className="h-4 w-4 mr-2" />
              Backup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
