import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConversationResponseDto } from "../types/conversation.types";
import { UserResponseDto } from "../types/user.types";
import { Users } from "lucide-react";
import { getObjectStorageBaseUrl } from "@/lib/env";

interface ConversationItemProps {
  chat: ConversationResponseDto;
  isSelected: boolean;
  chatName: string;
  currentUserId: string;
  userNamesMap: Record<string, string>;
  usersDataMap: Record<string, UserResponseDto>;
  onClick: () => void;
  onUserClick?: (user: UserResponseDto) => void;
}

export const ConversationItem = ({
  chat,
  isSelected,
  chatName,
  currentUserId,
  userNamesMap,
  usersDataMap,
  onClick,
  onUserClick
}: ConversationItemProps) => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();
  const isGroupChat = chat.participant_ids && chat.participant_ids.length > 2;
  
  // Get the other user's ID and data for direct conversations
  const otherUserId = chat.participant_ids?.find(id => id !== currentUserId);
  const otherUser = otherUserId ? usersDataMap[otherUserId] : null;
  
  // Construct the avatar URL using the same pattern as Admin.tsx
  const avatarUrl = !isGroupChat && otherUser?.active_avatar_url 
    ? `${objectStorageBaseUrl}/${otherUser.active_avatar_url}` 
    : "/default-avatar.svg";

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGroupChat && otherUser && onUserClick) {
      onUserClick(otherUser);
    }
  };
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      <div className="relative">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
          onClick={handleAvatarClick}
        >
          <AvatarImage 
            src={avatarUrl} 
            alt={`${chatName} avatar`}
          />
          <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {chatName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isGroupChat && (
          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
            <Users className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{chatName}</p>
            {isGroupChat && (
              <Badge variant="secondary" className="text-xs">
                Group
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {isGroupChat ? `${chat.participant_ids?.length} members` : "No messages yet"}
        </p>
      </div>
    </div>
  );
};