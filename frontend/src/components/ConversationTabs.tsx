import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConversationItem } from "./ConversationItem";
import { ConversationResponseDto } from "../types/conversation.types";
import { UserResponseDto } from "../types/user.types";
import { MessageCircle, Users } from "lucide-react";

interface ConversationTabsProps {
  chats: ConversationResponseDto[];
  selectedChat: ConversationResponseDto | null;
  currentUserId: string;
  userNamesMap: Record<string, string>;
  usersDataMap: Record<string, UserResponseDto>;
  onChatSelect: (chat: ConversationResponseDto) => void;
  onUserClick?: (user: UserResponseDto) => void;
}

export const ConversationTabs = ({
  chats,
  selectedChat,
  currentUserId,
  userNamesMap,
  usersDataMap,
  onChatSelect,
  onUserClick
}: ConversationTabsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  // Filter conversations based on type
  const allChats = chats.filter(chat => chat && chat.id && chat.participant_ids);
  const groupChats = allChats.filter(chat => chat.participant_ids && chat.participant_ids.length > 2);
  const oneOnOneChats = allChats.filter(chat => chat.participant_ids && chat.participant_ids.length === 2);

  const renderConversationList = (conversations: ConversationResponseDto[]) => {
    if (conversations.length === 0) {
      const isGroupTab = activeTab === "groups";
      return (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          {isGroupTab ? (
            <>
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No group chats yet</p>
              <p className="text-xs">Create a group to start chatting with multiple people!</p>
            </>
          ) : (
            <>
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new conversation to get chatting!</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="p-2">
        {conversations.map((chat) => {
          const otherUserId = chat.participant_ids?.find(id => id !== currentUserId);
          let chatName = "Unknown User";
          
          if (chat.participant_ids && chat.participant_ids.length > 2) {
            // Group chat - show participant count or group name
            chatName = `Group Chat (${chat.participant_ids.length})`;
          } else if (otherUserId) {
            // 1-on-1 chat
            chatName = userNamesMap[otherUserId] || "Loading...";
          }
          
          return (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              chatName={chatName}
              currentUserId={currentUserId}
              userNamesMap={userNamesMap}
              usersDataMap={usersDataMap}
              onClick={() => onChatSelect(chat)}
              onUserClick={onUserClick}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="all" className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4" />
          <span>All</span>
          {allChats.length > 0 && (
            <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-600 rounded-full px-1.5 py-0.5">
              {allChats.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="groups" className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>Groups</span>
          {groupChats.length > 0 && (
            <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-600 rounded-full px-1.5 py-0.5">
              {groupChats.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        {renderConversationList(allChats)}
      </TabsContent>
      
      <TabsContent value="groups" className="mt-0">
        {renderConversationList(groupChats)}
      </TabsContent>
    </Tabs>
  );
};