import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { UserResponseAdminDto } from '@/types/user';
import { getObjectStorageBaseUrl } from "@/lib/env";

const objectStorageBaseUrl = getObjectStorageBaseUrl();

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserResponseAdminDto) => void;
  users: UserResponseAdminDto[];
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({ isOpen, onClose, onSelectUser, users }) => {
  const [search, setSearch] = useState("");
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="card-cozy w-full max-w-md dark:bg-card-dark dark:text-card-foreground-dark">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-accent" />
            <span>Select User</span>
          </DialogTitle>
          <DialogDescription>
            Search and select a user to perform actions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3"
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : '/placeholder.svg'} />
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSelectionModal;
