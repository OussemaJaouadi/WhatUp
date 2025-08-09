import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Search,
  MessageCircle, 
  Users,
  X,
  Plus
} from "lucide-react";
import { userService } from "../services/user";
import { conversationService, CreateConversationRequest } from "../services/conversation";
import { useToast } from "@/components/ui/use-toast";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { UserResponseDto } from "../types/user";
import { ConversationResponseDto } from "../types/conversation";
import { useDebounce } from "../hooks/useDebounce";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserResponseDto;
  onConversationCreated: (conversation: ConversationResponseDto, userNamesMap: Record<string, string>) => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  currentUser,
  onConversationCreated
}: NewConversationDialogProps) => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResponseDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserResponseDto[]>([]);
  const [groupName, setGroupName] = useState("");
  const [activeTab, setActiveTab] = useState<"direct" | "group">("direct");
  
  // Debounce search query to avoid API calls on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setGroupName("");
      setActiveTab("direct");
    }
  }, [open]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await userService.searchUsers(query);
      // Filter out current user and already selected users
      const filteredResults = [result].filter(user => 
        user.id !== currentUser.id && 
        !selectedUsers.some(selected => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchResults([]);
      } else {
        toast({
          title: "Search failed",
          description: "Unable to search users at this time.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: UserResponseDto) => {
    if (activeTab === "direct") {
      // For direct messages, immediately create conversation
      handleCreateConversation([currentUser.id, user.id], "direct");
    } else {
      // For group chats, add to selected users
      if (!selectedUsers.some(selected => selected.id === user.id)) {
        setSelectedUsers(prev => [...prev, user]);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleCreateConversation = async (participantIds: string[], type: "direct" | "group", name?: string) => {
    try {
      const request: CreateConversationRequest = {
        type,
        participant_ids: participantIds,
        ...(type === "group" && name && { name })
      };

      const conversation = await conversationService.createConversation(request);
      
      // Build user names map for the new conversation
      const userNamesMap: Record<string, string> = {};
      const otherUserIds = participantIds.filter(id => id !== currentUser.id);
      
      for (const userId of otherUserIds) {
        const user = selectedUsers.find(u => u.id === userId) || 
                     searchResults.find(u => u.id === userId);
        if (user) {
          userNamesMap[userId] = user.username;
        }
      }
      
      onConversationCreated(conversation, userNamesMap);
      onOpenChange(false);
      
      toast({
        title: "Conversation created",
        description: type === "direct" 
          ? `You can now chat with @${Object.values(userNamesMap)[0]}`
          : `Group "${name}" created successfully`,
      });
    } catch (error) {
      toast({
        title: "Failed to create conversation",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length < 2) {
      toast({
        title: "Not enough participants",
        description: "Group conversations need at least 2 other participants.",
        variant: "destructive",
      });
      return;
    }

    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }

    const participantIds = [currentUser.id, ...selectedUsers.map(user => user.id)];
    handleCreateConversation(participantIds, "group", groupName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "direct" | "group")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : '/default-avatar.svg'} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">@{user.username}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUserSelect(user)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                No users found with username "{searchQuery}"
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="group" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Add Participants</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {selectedUsers.length > 0 && (
                <div>
                  <Label>Selected Participants ({selectedUsers.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                        @{user.username}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => handleRemoveUser(user.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : '/default-avatar.svg'} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">@{user.username}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUserSelect(user)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                No users found with username "{searchQuery}"
              </div>
            )}
            
            <Button 
              onClick={handleCreateGroup}
              disabled={selectedUsers.length < 2 || !groupName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Create Group ({selectedUsers.length + 1} members)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};