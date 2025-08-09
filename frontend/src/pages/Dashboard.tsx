import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Users, 
  Search,
  Send,
  Plus,
  User as UserIcon,
  Shield,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { conversationService } from "../services/conversation";
import { NewConversationDialog } from "@/components/NewConversationDialog";
import { messageService } from "../services/message";
import { useToast } from "@/components/ui/use-toast";
import { authUtils } from "@/lib/authUtils";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { ConversationResponseDto } from "../types/conversation.types";
import { Message } from "../types/message.types";
import { UserResponseDto } from "../types/user.types";
import { encryptMessage, decryptMessage } from "@/lib/cryptoUtils";
import { keyStorage } from "@/lib/keyStorage";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EncryptionSetupBanner } from "@/components/EncryptionSetupBanner";
import { ConversationTabs } from "@/components/ConversationTabs";
import { UserProfileModal } from "@/components/modals/UserProfileModal";

const Dashboard = () => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<ConversationResponseDto | null>(null);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  const [chats, setChats] = useState<ConversationResponseDto[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  const [usersDataMap, setUsersDataMap] = useState<Record<string, UserResponseDto>>({});
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserResponseDto | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const addMessage = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserClick = (user: UserResponseDto) => {
    setSelectedUserProfile(user);
    setShowUserProfile(true);
  };

  const handleUserProfileClose = () => {
    setShowUserProfile(false);
    setSelectedUserProfile(null);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getMe();
        setCurrentUser(user);
        await fetchConversations(user);
      } catch (error) {
        toast({
          title: "Error fetching user data",
          description: error.response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
        handleLogout();
      }
    };

    const fetchConversations = async (user: UserResponseDto) => {
      try {
        const userConversations = await conversationService.getMyConversations();
        setChats(userConversations);

        const newUserNamesMap: Record<string, string> = {};
        const newUsersDataMap: Record<string, UserResponseDto> = {};
        
        for (const conversation of userConversations) {
          const otherUserId = conversation.participant_ids?.find(id => id !== user.id);
          if (otherUserId && !newUserNamesMap[otherUserId]) {
            const userInfo = await userService.getUserById(otherUserId);
            newUserNamesMap[otherUserId] = userInfo.username;
            newUsersDataMap[otherUserId] = userInfo;
          }
        }
        setUserNamesMap(newUserNamesMap);
        setUsersDataMap(newUsersDataMap);

      } catch (error) {
        toast({
          title: "Error fetching conversations",
          description: error.response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const conversationMessages = await messageService.getConversationMessages(selectedChat.id);
          const decryptedMessages = await Promise.all(conversationMessages.map(async (msg) => {
            let displayedContent = msg.content;
            if (msg.is_encrypted) {
              const privateKey = await keyStorage.getPrivateKey(currentUser?.id || '');
              if (privateKey) {
                try {
                  displayedContent = await decryptMessage(privateKey, msg.content);
                } catch (e) {
                  console.error("Decryption failed:", e);
                  displayedContent = "[Encrypted message - decryption failed]";
                }
              } else {
                displayedContent = "[Encrypted message - private key not found]";
              }
            }
            return { ...msg, content: displayedContent };
          }));
          setMessages(decryptedMessages);
        } catch (error) {
          toast({
            title: "Error fetching messages",
            description: error.response?.data?.detail || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser]);

  const handleLogout = () => {
    authUtils.removeToken();
    authUtils.removeTempLoginPassword();
    navigate("/");
    toast({
      title: "See you soon! 👋",
      description: "You've been logged out. Come back anytime!",
    });
  };

  const handleConversationCreated = (conversation: ConversationResponseDto, newUserNamesMap: Record<string, string>) => {
    // Add to chats if not already there
    const existingChat = chats.find(chat => chat.id === conversation.id);
    if (!existingChat) {
      setChats(prev => [conversation, ...prev]);
      setUserNamesMap(prev => ({ ...prev, ...newUserNamesMap }));
      
      // Also fetch full user data for new conversation participants
      const fetchNewUsersData = async () => {
        const newUsersDataMap: Record<string, UserResponseDto> = {};
        for (const userId of conversation.participant_ids || []) {
          if (userId !== currentUser?.id && !usersDataMap[userId]) {
            try {
              const userInfo = await userService.getUserById(userId);
              newUsersDataMap[userId] = userInfo;
            } catch (error) {
              console.error(`Failed to fetch user data for user ${userId}:`, error);
            }
          }
        }
        setUsersDataMap(prev => ({ ...prev, ...newUsersDataMap }));
      };
      
      fetchNewUsersData();
    }
    
    setSelectedChat(conversation);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !currentUser) return;

    try {
      let contentToSend = message;
      let encryptedStatus = isEncrypted;

      if (isEncrypted) {
        const otherUserId = selectedChat.participant_ids?.find(id => id !== currentUser?.id);
        if (!otherUserId) {
          toast({
            title: "Error",
            description: "Cannot find recipient for this conversation.",
            variant: "destructive",
          });
          return;
        }
        const recipientPublicKeyResponse = await userService.getPublicKey(otherUserId);
        const recipientPublicKey = recipientPublicKeyResponse.public_key;

        if (!recipientPublicKey) {
          toast({
            title: "Encryption Failed",
            description: "Recipient's public key not found. Cannot send encrypted message.",
            variant: "destructive",
          });
          return;
        }
        const encrypted = await encryptMessage(recipientPublicKey, message);
        contentToSend = encrypted;
      }

      const newMessage = await messageService.sendMessage(
        currentUser.id,
        selectedChat.participant_ids?.find(id => id !== currentUser?.id),
        selectedChat.id,
        contentToSend,
        encryptedStatus
      );
      addMessage(newMessage);
      setMessage("");
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Encryption Setup Banner */}
        {currentUser && (
          <EncryptionSetupBanner 
            userId={currentUser.id} 
            userHasPublicKey={!!currentUser.public_key}
            userPublicKey={currentUser.public_key || undefined}
          />
        )}
        
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Messages</h2>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowNewMessage(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <ConversationTabs
                  chats={chats}
                  selectedChat={selectedChat}
                  currentUserId={currentUser?.id || ''}
                  userNamesMap={userNamesMap}
                  usersDataMap={usersDataMap}
                  onChatSelect={setSelectedChat}
                  onUserClick={handleUserClick}
                />
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedChat ? (
              <Card className="h-full flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                      onClick={() => {
                        const otherUserId = selectedChat.participant_ids?.find(id => id !== currentUser?.id);
                        const otherUser = otherUserId ? usersDataMap[otherUserId] : null;
                        if (otherUser) {
                          handleUserClick(otherUser);
                        }
                      }}
                    >
                      <AvatarImage 
                        src={(() => {
                          const otherUserId = selectedChat.participant_ids?.find(id => id !== currentUser?.id);
                          const otherUser = otherUserId ? usersDataMap[otherUserId] : null;
                          return otherUser?.active_avatar_url 
                            ? `${objectStorageBaseUrl}/${otherUser.active_avatar_url}` 
                            : "/default-avatar.svg";
                        })()} 
                        alt="User avatar"
                      />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {selectedChat.participant_ids?.find(id => id !== currentUser?.id) ? 
                          userNamesMap[selectedChat.participant_ids.find(id => id !== currentUser?.id)!]?.slice(0, 2).toUpperCase() : 
                          "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 
                        className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          const otherUserId = selectedChat.participant_ids?.find(id => id !== currentUser?.id);
                          const otherUser = otherUserId ? usersDataMap[otherUserId] : null;
                          if (otherUser) {
                            handleUserClick(otherUser);
                          }
                        }}
                      >
                        {selectedChat.participant_ids?.find(id => id !== currentUser?.id) ? 
                          userNamesMap[selectedChat.participant_ids.find(id => id !== currentUser?.id)!] : 
                          "Unknown User"}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isEncrypted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.sender_id === currentUser?.id
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${
                              msg.sender_id === currentUser?.id 
                                ? 'text-blue-100' 
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.sender_id === currentUser?.id && (
                              <CheckCircle2 className="h-3 w-3 text-blue-200" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="encryption"
                        checked={isEncrypted}
                        onCheckedChange={setIsEncrypted}
                        className="data-[state=checked]:bg-green-600"
                      />
                      <Label htmlFor="encryption" className="text-sm text-slate-600 dark:text-slate-400">
                        End-to-end encryption
                      </Label>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-100 mb-2">
                      Welcome to WhatUp!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Select a conversation or start a new one to begin messaging.
                    </p>
                    <Button 
                      onClick={() => setShowNewMessage(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        
        {/* New Conversation Dialog */}
        {currentUser && (
          <NewConversationDialog
            open={showNewMessage}
            onOpenChange={setShowNewMessage}
            currentUser={currentUser}
            onConversationCreated={handleConversationCreated}
          />
        )}

        {/* User Profile Modal */}
        <UserProfileModal
          user={selectedUserProfile}
          isOpen={showUserProfile}
          onClose={handleUserProfileClose}
        />
      </div>
    </div>
  );
};

export default Dashboard;