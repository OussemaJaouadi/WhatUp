import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserResponseDto } from "../../types/user.types";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { Crown, Mail, Calendar, User as UserIcon, MessageCircle } from "lucide-react";

interface UserProfileModalProps {
  user: UserResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onStartConversation?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartConversation
}) => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();

  if (!user) return null;

  const avatarUrl = user.active_avatar_url 
    ? `${objectStorageBaseUrl}/${user.active_avatar_url}` 
    : "/default-avatar.svg";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-blue-600" />
            <span>User Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={`${user.username} avatar`} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-lg">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                @{user.username}
              </h3>
              <div className="flex items-center justify-center space-x-2 mt-2">
                {user.role === "admin" && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {user.account_confirmed && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{user.email}</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            {user.bio && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bio</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onStartConversation && (
              <Button 
                onClick={() => {
                  onStartConversation(user.id);
                  onClose();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};