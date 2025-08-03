import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Search,
  Send,
  Coffee,
  Crown,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { conversationService } from "../services/conversation";
import { messageService } from "../services/message";
import { useToast } from "@/components/ui/use-toast";
import { authUtils } from "@/lib/authUtils";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { ConversationResponseDto } from "@/types/conversation";
import { Message } from "@/types/message";
import { UserResponseDto } from "@/types/user";
import { encryptMessage, decryptMessage } from "@/lib/cryptoUtils";
import { keyStorage } from "@/lib/keyStorage";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KeySetupModal } from "@/components/modals/KeySetupModal";
import { EncryptionSetupBanner } from "@/components/EncryptionSetupBanner";

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
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);

  const addMessage = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getMe();
        setCurrentUser(user);
        
        // Check if user needs key setup (no public key means no encryption keys)
        if (!user.public_key) {
          // Check if this is the first time we're prompting for key setup
          const hasBeenPrompted = localStorage.getItem(`key_setup_prompted_${user.id}`);
          if (!hasBeenPrompted) {
            setShowKeySetup(true);
            localStorage.setItem(`key_setup_prompted_${user.id}`, 'true');
          }
        }

        // Now fetch conversations after we have the user data
        await fetchConversations(user);
      } catch (error) {
        toast({
          title: "Error fetching user data",
          description: error.response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
        // If fetching user fails, likely token is invalid or expired, log out
        handleLogout();
      }
    };

    const fetchConversations = async (user: UserResponseDto) => {
      try {
        const userConversations = await conversationService.getMyConversations();
        setChats(userConversations);

        const newUserNamesMap: Record<string, string> = {};
        for (const conversation of userConversations) {
          const otherUserId = conversation.participant_ids.find(id => id !== user.id);
          if (otherUserId && !newUserNamesMap[otherUserId]) {
            const userInfo = await userService.getUserById(otherUserId);
            newUserNamesMap[otherUserId] = userInfo.username;
          }
        }
        setUserNamesMap(newUserNamesMap);

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
              const privateKey = localStorage.getItem('privateKey');
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
  }, [selectedChat]);

  const handleLogout = () => {
    authUtils.removeToken();
    authUtils.removeTempLoginPassword(); // Clean up stored password
    navigate("/");
    toast({
      title: "See you soon! 👋",
      description: "You've been logged out. Come back anytime!",
    });
  };

  const handleKeySetupComplete = async () => {
    setShowKeySetup(false);
    // Refresh user data to get the updated public key
    try {
      const updatedUser = await userService.getMe();
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user data after key setup:', error);
    }
    toast({
      title: "🎉 Encryption Setup Complete!",
      description: "Your account is now secured with end-to-end encryption. Happy messaging!",
    });
  };

  const handleKeySetupSkip = () => {
    setShowKeySetup(false);
    toast({
      title: "Setup Skipped",
      description: "You can set up encryption later in your profile settings.",
    });
  };



  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-cozy-fade-in text-lg text-muted-foreground">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] gradient-cozy dark:bg-[#181926] text-foreground flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Encryption Setup Banner */}
        {currentUser && (
          <EncryptionSetupBanner 
            userId={currentUser.id} 
            userHasPublicKey={!!currentUser.public_key}
            userPublicKey={currentUser.public_key || undefined}
          />
        )}
        
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Sidebar - Chats List */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="card-cozy animate-cozy-fade-in bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-foreground">Chats</h2>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10 input-cozy" />
              </div>
              <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {chats.map((chat) => {
                  const isSelected = selectedChat?.id === chat.id;
                  const otherUserId = chat.participant_ids.find(id => id !== currentUser.id);
                  const chatName = otherUserId ? userNamesMap[otherUserId] || "Loading..." : "Unknown User";
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all animate-cozy-slide-up mb-1
                        ${isSelected
                          ? 'bg-primary/15 shadow-cozy dark:bg-[#2a2b3d] dark:shadow-[0_2px_12px_0_rgba(255,255,0,0.08)]'
                          : 'bg-card/80 hover:bg-muted/60 dark:bg-[#23243a] dark:hover:bg-[#23243a]/80 dark:text-slate-100 dark:shadow-[0_1px_4px_0_rgba(0,0,0,0.18)]'}
                      `}
                      style={{ minHeight: '38px', fontSize: '0.97rem' }}
                    >
                      <Avatar className={`h-7 w-7 min-w-[28px] min-h-[28px] shadow-sm ${isSelected ? 'ring-2 ring-primary/60 dark:ring-primary' : ''}`}>
                        <AvatarImage src="/default-avatar.svg" />
                        <AvatarFallback className="bg-accent/10 text-accent text-xs dark:bg-slate-700 dark:text-slate-200">
                          {chatName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${isSelected ? 'text-primary dark:text-primary' : 'dark:text-slate-100'}`}>{chatName}</span>
                          {/* Unread badge can be implemented later if backend provides unread count */}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-[12px] truncate ${isSelected ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-slate-300'}`}>{"lastMessage" in chat ? (chat.lastMessage as string) : "No messages yet"}</p>
                          <span className="text-[10px] text-muted-foreground ml-2 whitespace-nowrap dark:text-slate-400">{new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </aside>

          {/* Main Chat Area */}
          <main className="lg:col-span-3">
            {selectedChat ? (
              <Card className="card-cozy h-full flex flex-col bg-card/95 dark:bg-[#23243a] border border-border/70 dark:border-transparent shadow-cozy-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.35)] animate-cozy-fade-in transition-colors">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/default-avatar.svg" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedChat.participant_ids.find(id => id !== currentUser.id) ? 
                          userNamesMap[selectedChat.participant_ids.find(id => id !== currentUser.id)!]?.slice(0, 2).toUpperCase() : 
                          "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {selectedChat.participant_ids.find(id => id !== currentUser.id) ? 
                          userNamesMap[selectedChat.participant_ids.find(id => id !== currentUser.id)!] : 
                          "Unknown User"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Online
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex flex-col rounded-xl px-4 py-2 max-w-[75%] break-words shadow-md transition-all duration-300 ease-in-out
                          ${msg.sender_id === currentUser.id
                            ? 'bg-primary text-primary-foreground rounded-br-none self-end animate-cozy-slide-up'
                            : 'bg-card text-foreground rounded-bl-none self-start animate-cozy-fade-in'}'
                        `}
                        style={{ fontSize: '0.95rem', lineHeight: 1.4 }}
                      >
                        {msg.sender_id !== currentUser.id && (
                          <span className="block text-xs font-semibold text-primary-foreground/80 dark:text-primary-foreground/80 mb-1">@{userNamesMap[msg.sender_id] || "Unknown User"}</span>
                        )}
                        <span className="block text-balance">{msg.content}</span>
                        <span className={`block text-[10px] mt-1 ${msg.sender_id === currentUser.id ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border/50 bg-card/80">
                  <div className="flex items-center justify-end mb-2">
                    <Label htmlFor="e2e-encryption" className="mr-2 text-sm">End-to-End Encryption</Label>
                    <Switch
                      id="e2e-encryption"
                      checked={isEncrypted}
                      onCheckedChange={setIsEncrypted}
                    />
                  </div>
                  <form
                    className="flex space-x-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!message.trim() || !selectedChat || !currentUser) return;

                      try {
                        let contentToSend = message;
                        let encryptedStatus = isEncrypted;

                        if (isEncrypted) {
                          const otherUserId = selectedChat.participant_ids.find(id => id !== currentUser.id);
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
                          selectedChat.participant_ids.find(id => id !== currentUser.id),
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
                    }}
                  >
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 input-cozy"
                    />
                    <Button type="submit" className="btn-primary rounded-full shadow-cozy">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="card-cozy h-full flex items-center justify-center bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy">
                <div className="text-center space-y-4">
                  <Coffee className="h-16 w-16 text-primary mx-auto animate-cozy-bounce" />
                  <div>
                    <h3 className="font-bold text-2xl text-foreground mb-2">Welcome to WhatUp!</h3>
                    <p className="text-muted-foreground text-base">
                      Select a chat to start the conversation, just like gathering around your favorite coffee shop table.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
      
      {/* Key Setup Modal for first-time users */}
      <KeySetupModal 
        isOpen={showKeySetup}
        onClose={handleKeySetupSkip}
        onComplete={handleKeySetupComplete}
      />
    </div>
  );
};

export default Dashboard;