import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Download, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { keyStorage } from "@/lib/keyStorage";
import * as cryptoUtils from "@/lib/cryptoUtils";
import { userService } from "@/services/user";

interface RecoverPrivateKeyModalProps {
  currentUserId: string;
}

export const RecoverPrivateKeyModal = ({ currentUserId }: RecoverPrivateKeyModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");

  const handleRecoverPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your backup password.",
        variant: "destructive",
      });
      return;
    }
    try {
      const encryptedData = await userService.getEncryptedPrivateKeyBackup();
      if (!encryptedData) {
        toast({
          title: "No Backup Found",
          description: "No private key backup found on the server.",
          variant: "destructive",
        });
        return;
      }
      const privateKey = await cryptoUtils.decryptPrivateKey(encryptedData, recoveryPassword);
      await keyStorage.savePrivateKey(currentUserId, privateKey);
      toast({
        title: "Private Key Recovered",
        description: "Your private key has been successfully recovered and stored locally.",
      });
      setRecoveryPassword("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error recovering private key:", error);
      toast({
        title: "Recovery Failed",
        description: error.response?.data?.detail || "An error occurred during private key recovery. Check your password.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Recover Private Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recover Private Key</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the password you used when backing up your private key. This is usually your account password unless you chose a different one.
        </p>
        <form onSubmit={handleRecoverPrivateKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-modal-password">Backup Password</Label>
            <Input
              id="recovery-modal-password"
              type="password"
              placeholder="Enter your backup password (usually your account password)"
              value={recoveryPassword}
              onChange={(e) => setRecoveryPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Try your account password first, or the custom password if you set one.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                setRecoveryPassword("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Recover
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
