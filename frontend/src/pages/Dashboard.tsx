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
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
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
    localStorage.removeItem("jwt_token");
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
    return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>; // Or a loading spinner
  }

  return (
    <div className="min-h-screen gradient-cozy">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-accent" />
                <h1 className="text-2xl font-crimson font-bold">WhatUp</h1>
              </div>
              <Coffee className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="relative"
              >
                <User className="h-5 w-5" />
              </Button>
              
              {currentUser.role === "admin" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/admin")}
                  className="relative"
                >
                  <Crown className="h-5 w-5 text-yellow-500" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar - Chats List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="card-cozy">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-crimson font-semibold text-lg">Chats</h2>
                <Button size="sm" variant="ghost">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10" />
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id 
                        ? 'bg-accent/10 border-2 border-accent/20' 
                        : 'hover:bg-muted/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-accent/10 text-accent">
                          {chat.participants.length > 1 ? '👥' : chat.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{chat.name}</span>
                          {chat.unread > 0 && (
                            <Badge variant="default" className="text-xs">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* User Profile Card */}
            <Card className="card-cozy">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentUser.profileImage} />
                  <AvatarFallback className="bg-accent/10 text-accent">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">@{currentUser.username}</span>
                    {currentUser.role === "admin" && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedChat ? (
              <Card className="card-cozy h-full flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-accent/10 text-accent">
                        {selectedChat.participants.length > 1 ? '👥' : selectedChat.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-crimson font-semibold">{selectedChat.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.participants.length > 1 
                          ? `${selectedChat.participants.length} members` 
                          : 'Online'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === currentUser.username ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === currentUser.username
                            ? 'bg-accent text-accent-foreground ml-12'
                            : 'bg-muted mr-12'
                        }`}
                      >
                        {msg.sender !== currentUser.username && (
                          <p className="text-xs font-medium text-accent mb-1">@{msg.sender}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // Handle send message
                          setMessage("");
                        }
                      }}
                      className="flex-1"
                    />
                    <Button className="btn-accent">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="card-cozy h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Coffee className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-crimson text-xl font-semibold mb-2">Welcome to WhatUp!</h3>
                    <p className="text-muted-foreground">
                      Select a chat to start the conversation, just like gathering around 
                      your favorite coffee shop table.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;