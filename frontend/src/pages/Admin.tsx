import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Users, 
  Trash2,
  Edit3,
  Search,
  UserPlus,
  Settings,
  MessageCircle,
  Crown,
  CheckCircle,
  XCircle,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { useToast } from "@/components/ui/use-toast";
import { UserResponseAdminDto } from '@/types/user';
import { UserImageResponseDto } from '@/types/userImage';
import { authUtils } from "@/lib/authUtils";
import { getObjectStorageBaseUrl } from "@/lib/env";

const objectStorageBaseUrl = getObjectStorageBaseUrl();

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserResponseAdminDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponseAdminDto | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editAccountConfirmed, setEditAccountConfirmed] = useState<boolean | string>("");
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [selectedUserProfileImages, setSelectedUserProfileImages] = useState<UserImageResponseDto[]>([]);

  // Fix: Add missing handler stubs
  const handleDeleteUser = (userId: string) => {
    // TODO: Implement user deletion logic
    toast({
      title: "Delete User",
      description: `User with ID ${userId} deleted (stub).`,
      variant: "default",
    });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement user edit logic
    toast({
      title: "Edit User",
      description: `User changes saved (stub).`,
      variant: "default",
    });
    setSelectedUser(null);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error fetching users",
          description: (error as any).response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const fetchUserProfileImages = useCallback(async (userId: string) => {
    try {
      const images = await userService.adminGetUserProfileImages(userId);
      setSelectedUserProfileImages(images);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error fetching user profile images",
          description: (error as any).response?.data?.detail || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.accountConfirmed).length,
    adminUsers: users.filter(u => u.role === "admin").length,
    pendingUsers: users.filter(u => !u.accountConfirmed).length,
  };

  return (
    <div className="min-h-screen gradient-cozy bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border dark:bg-card-dark/80 dark:border-border-dark">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-5 w-5 text-accent" />
                <span className="font-crimson font-semibold">WhatUp</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h1 className="text-xl font-crimson font-semibold">Admin Panel</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="hidden sm:inline-flex"
              >
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex"
              >
                Back to Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-cozy text-center bg-card dark:bg-card-dark text-card-foreground dark:text-card-foreground-dark">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          
          <Card className="card-cozy text-center dark:bg-card-dark dark:text-card-foreground-dark">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </Card>
          
          <Card className="card-cozy text-center dark:bg-card-dark dark:text-card-foreground-dark">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.adminUsers}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </Card>
          
          <Card className="card-cozy text-center dark:bg-card-dark dark:text-card-foreground-dark">
            <XCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.pendingUsers}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Activity Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Search and Actions */}
              <Card className="card-cozy dark:bg-card-dark dark:text-card-foreground-dark">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button className="btn-accent">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </Card>

              {/* Users List */}
              <Card className="card-cozy dark:bg-card-dark dark:text-card-foreground-dark">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          {/* Use user's active_avatar_url if present, otherwise fallback to placeholder */}
                          <AvatarImage
                            src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : '/placeholder.svg'}
                            alt={user.username}
                          />
                          <AvatarFallback className="bg-accent/10 text-accent">
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">@{user.username}</span>
                            {user.role === "admin" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.accountConfirmed ? "default" : "secondary"}>
                              {user.accountConfirmed ? "Verified" : "Pending"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete @{user.username}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="card-cozy">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-crimson font-semibold">System Settings</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Registration Mode</Label>
                    <Select defaultValue="open">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open Registration</SelectItem>
                        <SelectItem value="invite">Invite Only</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Role</Label>
                    <Select defaultValue="user">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="btn-cozy">
                  Save Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card className="card-cozy">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-crimson font-semibold">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: "User Registration", user: "ted_mosby", time: "2 minutes ago" },
                  { action: "Profile Update", user: "barney_stinson", time: "15 minutes ago" },
                  { action: "Admin Action", user: "robin_scherbatsky", time: "1 hour ago" },
                  { action: "User Login", user: "lily_aldrin", time: "2 hours ago" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-muted-foreground">by @{log.user}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{log.time}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="card-cozy w-full max-w-md dark:bg-card-dark dark:text-card-foreground-dark">
            <div className="flex items-center space-x-3 mb-6">
              <Edit3 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-crimson font-semibold">Edit User</h2>
            </div>
            
            <form className="space-y-4" onSubmit={handleEditUser}>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Account Status</Label>
                <Select 
                  value={editAccountConfirmed ? "confirmed" : "pending"}
                  onValueChange={(value) => setEditAccountConfirmed(value === "confirmed")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {selectedUserProfileImages.map((image) => (
                    <div key={image.id} className="relative w-full h-24 rounded-md overflow-hidden">
                      <img 
                        src={`${objectStorageBaseUrl}/${image.image_key}`}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                      {image.is_active && (
                        <Badge className="absolute top-1 left-1">Active</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <Input 
                    id="edit-profile-picture" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setEditProfileImage(e.target.files ? e.target.files[0] : null)}
                    className="hidden" // Hide default input
                  />
                  <Label htmlFor="edit-profile-picture" className="btn-outline cursor-pointer">
                    Upload New Image
                  </Label>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="btn-cozy flex-1">
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;