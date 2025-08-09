import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Shield, 
  Edit3, 
  Eye, 
  User as UserIcon,
  Search,
  Trash2,
  Activity,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserResponseAdminDto, UserRole, UserAdminEdit } from "@/types/user";
import { UserImageResponseDto } from "@/types/userImage";
import { userService } from "@/services/user";
import { getObjectStorageBaseUrl } from "@/lib/env";
import EditUserModal from "@/components/modals/EditUserModal";
import ViewUserModal from "@/components/modals/ViewUserModal";
import { authUtils } from "@/lib/authUtils";

const Admin = () => {
  const objectStorageBaseUrl = getObjectStorageBaseUrl();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserResponseAdminDto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserResponseAdminDto | null>(null);
  const [viewUser, setViewUser] = useState<UserResponseAdminDto | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editAccountConfirmed, setEditAccountConfirmed] = useState<boolean>(false);
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [editBio, setEditBio] = useState<string | null>(null);
  const [selectedUserProfileImages, setSelectedUserProfileImages] = useState<UserImageResponseDto[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    const token = authUtils.getToken();
    if (token) {
      const decodedToken = authUtils.decodeToken(token);
      if (decodedToken) {
        setCurrentUserId(decodedToken.sub);
      }
    }
  }, [fetchUsers]);

  const handleEditUserOpen = async (user: UserResponseAdminDto) => {
    try {
      const fullUser = await userService.getUserById(user.id);
      setSelectedUser(fullUser);
      setEditRole(fullUser.role);
      setEditAccountConfirmed(fullUser.account_confirmed);
      setEditBio(fullUser.bio || null);
      fetchUserProfileImages(fullUser.id);
    } catch (error) {
      toast({
        title: "Error fetching user details",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleViewUserOpen = async (user: UserResponseAdminDto) => {
    try {
      const fullUser = await userService.getUserById(user.id);
      setViewUser(fullUser);
      fetchUserProfileImages(fullUser.id);
    } catch (error) {
      toast({
        title: "Error fetching user details",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfileImages = useCallback(async (userId: string) => {
    try {
      const images: UserImageResponseDto[] = await userService.adminGetUserProfileImages(userId);
      setSelectedUserProfileImages(images);
    } catch (error) {
      toast({
        title: "Error fetching user profile images",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const userData: UserAdminEdit = {
        role: editRole,
        account_confirmed: editAccountConfirmed,
        bio: editBio,
      };
      await userService.adminEditUser(selectedUser.id, userData, editProfileImage ?? undefined);
      toast({
        title: "User updated",
        description: "User information has been saved successfully.",
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error editing user",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.adminDeleteUser(userId);
      toast({
        title: "User deleted",
        description: "User account has been permanently deleted.",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.account_confirmed).length,
    adminUsers: users.filter(u => u.role === "admin").length,
    pendingUsers: users.filter(u => !u.account_confirmed).length,
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage users, settings, and monitor system activity
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalUsers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeUsers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.adminUsers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Admins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.pendingUsers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-400">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-400">
              <Database className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-400">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all user accounts</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          user.id === currentUserId 
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : '/default-avatar.svg'} 
                            />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                @{user.username}
                              </h3>
                              {user.role === "admin" && (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {user.id === currentUserId && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${user.account_confirmed ? 'bg-green-500' : 'bg-orange-500'}`} />
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {user.account_confirmed ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUserOpen(user)}
                            className="hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUserOpen(user)}
                            className="hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUserId && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure application settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Application Settings</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="app-name">Application Name</Label>
                        <Input id="app-name" defaultValue="WhatUp" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-users">Maximum Users</Label>
                        <Input id="max-users" type="number" defaultValue="1000" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Security Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <Label className="font-medium">New Registrations</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Allow new users to register</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <Label className="font-medium">Email Verification</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Require email verification</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Monitor system activity and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "User Registration", user: "john_doe", time: "2 minutes ago", type: "success" },
                    { action: "Profile Update", user: "jane_smith", time: "15 minutes ago", type: "info" },
                    { action: "Admin Action", user: "admin_user", time: "1 hour ago", type: "warning" },
                    { action: "User Login", user: "mike_wilson", time: "2 hours ago", type: "info" },
                    { action: "Account Deletion", user: "old_user", time: "3 hours ago", type: "error" },
                  ].map((log, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-green-500' :
                          log.type === 'warning' ? 'bg-amber-500' :
                          log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{log.action}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">by @{log.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ViewUserModal
        user={viewUser}
        profileImages={selectedUserProfileImages}
        onClose={() => setViewUser(null)}
        objectStorageBaseUrl={objectStorageBaseUrl}
      />

      <EditUserModal
        selectedUser={selectedUser}
        selectedUserProfileImages={selectedUserProfileImages}
        editRole={editRole}
        setEditRole={setEditRole}
        editAccountConfirmed={editAccountConfirmed}
        setEditAccountConfirmed={setEditAccountConfirmed}
        editProfileImage={editProfileImage}
        setEditProfileImage={setEditProfileImage}
        editBio={editBio}
        setEditBio={setEditBio}
        handleEditUser={handleEditUser}
        onClose={() => setSelectedUser(null)}
        objectStorageBaseUrl={objectStorageBaseUrl}
      />
    </div>
  );
};

export default Admin;