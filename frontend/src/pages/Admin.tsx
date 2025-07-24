import { useState, useEffect } from "react";
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

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [editAccountConfirmed, setEditAccountConfirmed] = useState<boolean | string>("");
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [selectedUserProfileImages, setSelectedUserProfileImages] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditRole(selectedUser.role);
      setEditAccountConfirmed(selectedUser.accountConfirmed);
      fetchUserProfileImages(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfileImages = async (userId: string) => {
    try {
      const images = await userService.adminGetUserProfileImages(userId);
      setSelectedUserProfileImages(images);
    } catch (error: any) {
      toast({
        title: "Error fetching user profile images",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.adminDeleteUser(userId);
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const userData: { role?: string; account_confirmed?: boolean } = {};
      if (editRole) {
        userData.role = editRole;
      }
      if (editAccountConfirmed !== "") {
        userData.account_confirmed = editAccountConfirmed === "confirmed";
      }

      await userService.adminEditUser(selectedUser.id, userData, editProfileImage);
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
      setSelectedUser(null); // Close modal
      setEditProfileImage(null);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

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
    <div className="min-h-screen gradient-cozy">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
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
          <Card className="card-cozy text-center">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          
          <Card className="card-cozy text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </Card>
          
          <Card className="card-cozy text-center">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.adminUsers}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </Card>
          
          <Card className="card-cozy text-center">
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
              <Card className="card-cozy">
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
              <Card className="card-cozy">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profileImage} alt={user.username} />
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
          <Card className="card-cozy w-full max-w-md">
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
                        src={`${import.meta.env.VITE_API_BASE_URL}user/profile-images/${image.id}/data`}
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