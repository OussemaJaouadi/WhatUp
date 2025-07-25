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
  User,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { useToast } from "@/components/ui/use-toast";
import { authUtils } from "@/lib/authUtils";
import { getObjectStorageBaseUrl } from "@/lib/env";

const Dashboard = () => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getMe();
        setCurrentUser(user);
      } catch (error: any) {
        toast({
          title: "Error fetching user data",
          description: error.response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
        // If fetching user fails, likely token is invalid or expired, log out
        handleLogout();
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    authUtils.removeToken();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  // Mock data - replace with actual API calls
  const [chats] = useState([
    {
      id: "1",
      name: "MacLaren's Gang",
      lastMessage: "Hey, anyone up for drinks tonight?",
      timestamp: "2 min ago",
      unread: 3,
      participants: ["ted_mosby", "barney_stinson", "robin_scherbatsky", "lily_aldrin", "marshall_eriksen"]
    },
    {
      id: "2", 
      name: "Barney Stinson",
      lastMessage: "Suit up! 🤵",
      timestamp: "15 min ago",
      unread: 1,
      participants: ["barney_stinson"]
    },
    {
      id: "3",
      name: "Robin Scherbatsky", 
      lastMessage: "Thanks for the help earlier",
      timestamp: "1 hour ago",
      unread: 0,
      participants: ["robin_scherbatsky"]
    }
  ]);

  const [messages] = useState([
    {
      id: "1",
      sender: "barney_stinson",
      content: "Hey Ted! How's the architecture project going?",
      timestamp: "10:30 AM"
    },
    {
      id: "2", 
      sender: "ted_mosby",
      content: "It's coming along well! The client loves the sustainable design elements.",
      timestamp: "10:32 AM"
    },
    {
      id: "3",
      sender: "barney_stinson", 
      content: "That's awesome! We should celebrate at MacLaren's tonight.",
      timestamp: "10:33 AM"
    }
  ]);

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-cozy-fade-in text-lg text-muted-foreground">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Sidebar - Chats List */}
          <aside className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="card-cozy animate-cozy-fade-in bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="flex items-center space-x-2 py-1 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={currentUser.active_avatar_url ? `${objectStorageBaseUrl}/${currentUser.active_avatar_url}` : "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-sm text-foreground truncate">@{currentUser.username}</span>
                    {currentUser.role === "admin" && (
                      <Crown className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </Card>
            <Card className="card-cozy animate-cozy-fade-in bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
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
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`chat-bubble cursor-pointer transition-all animate-cozy-slide-up px-2 py-1 rounded-md
                        ${isSelected
                          ? 'bg-primary/10 border-2 border-primary shadow-cozy-lg text-primary-foreground'
                          : 'hover:bg-muted/60 border border-transparent text-foreground'}
                      `}
                      style={{ minHeight: '40px', fontSize: '0.875rem' }}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-accent/10 text-accent text-xs">
                            {chat.participants.length > 1 ? '👥' : chat.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold truncate ${isSelected ? 'text-primary' : ''}`}>{chat.name}</span>
                            {chat.unread > 0 && (
                                                            <Badge variant="default" className={`text-xs ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/80 text-primary-foreground'}`}>
                                {chat.unread}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs truncate ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{chat.lastMessage}</p>
                          <p className={`text-xs ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{chat.timestamp}</p>
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
              <Card className="card-cozy h-full flex flex-col bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg animate-cozy-fade-in">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedChat.participants.length > 1 ? '👥' : selectedChat.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{selectedChat.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.participants.length > 1 
                          ? `${selectedChat.participants.length} members` 
                          : 'Online'
                        }
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === currentUser.username ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`chat-bubble ${
                          msg.sender === currentUser.username
                            ? 'chat-bubble-sent' 
                            : 'chat-bubble-received'
                        }`}
                      >
                        {msg.sender !== currentUser.username && (
                          <p className="text-xs font-medium text-primary mb-1">@{msg.sender}</p>
                        )}
                        <p className="text-base">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-card/80">
                  <form className="flex space-x-2" onSubmit={e => {e.preventDefault(); setMessage("");}}>
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
              <Card className="card-cozy h-full flex items-center justify-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl">
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
    </div>
  );
};

export default Dashboard;