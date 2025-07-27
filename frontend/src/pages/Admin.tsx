import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Crown, CheckCircle, XCircle, Settings, Shield, Edit3, Upload, Eye, User as UserIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UserResponseAdminDto, UserRole, UserAdminEdit } from "@/types/user";
import { UserImageResponseDto } from "@/types/userImage";
import { EditUserModalProps, ViewUserModalProps } from "@/types/modal";
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

  // Fetch users on mount
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
        title: "Edit User",
        description: `User changes saved successfully!`,
        variant: "default",
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
        title: "Delete User",
        description: `User deleted successfully!`,
        variant: "default",
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
  totalUsers: filteredUsers.length,
  activeUsers: filteredUsers.filter(u => u.account_confirmed).length,
  adminUsers: filteredUsers.filter(u => u.role === "admin").length,
  pendingUsers: filteredUsers.filter(u => !u.account_confirmed).length,
};

  return (
    <div className="min-h-screen gradient-cozy bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-cozy text-center bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>
          <Card className="card-cozy text-center bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </Card>
          <Card className="card-cozy text-center bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.adminUsers}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </Card>
          <Card className="card-cozy text-center bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors">
            <XCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-crimson font-bold">{stats.pendingUsers}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/80 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy rounded-lg p-1">
            <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md py-2 px-4 transition-all duration-300">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md py-2 px-4 transition-all duration-300">
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md py-2 px-4 transition-all duration-300">
              <Shield className="h-4 w-4" />
              <span>Activity Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <Card className="card-cozy dark:bg-card-dark dark:text-card-foreground-dark flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <Input placeholder="Search users..." className="w-full sm:w-64 input-cozy" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
              </Card>
              <Card className="card-cozy dark:bg-card-dark dark:text-card-foreground-dark">
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground">No users found.</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card key={user.id} className={`flex items-center justify-between p-4 rounded-lg bg-card/80 hover:bg-muted/60 dark:bg-[#23243a] dark:hover:bg-[#23243a]/80 dark:text-slate-100 dark:shadow-[0_1px_4px_0_rgba(0,0,0,0.18)] transition-all animate-cozy-slide-up ${user.id === currentUserId ? 'border-2 border-primary shadow-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                          {user.active_avatar_url ? (
                            <img
                              src={`${objectStorageBaseUrl}/${user.active_avatar_url}`}
                              alt={user.username}
                              className="h-10 w-10 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                              <UserIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">@{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewUserOpen(user)} title="View">
                            <Eye className="h-5 w-5 text-accent" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditUserOpen(user)} title="Edit">
                            <Edit3 className="h-5 w-5 text-primary" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
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
                    <Label htmlFor="app-name">Application Name</Label>
                    <Input id="app-name" defaultValue="WhatUp" className="input-cozy" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-users">Max Users</Label>
                    <Input id="max-users" type="number" defaultValue={1000} className="input-cozy" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/80">
                    <Label htmlFor="enable-registration" className="font-medium">Enable New Registrations</Label>
                    <Switch id="enable-registration" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/80">
                    <Label htmlFor="email-verification" className="font-medium">Require Email Verification</Label>
                    <Switch id="email-verification" />
                  </div>
                </div>
                <Button className="btn-primary">Save Settings</Button>
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
                  <Card key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card/60 dark:bg-[#23243a]/60 shadow-sm">
                    <span className="font-medium text-accent">{log.action}</span>
                    <span className="text-muted-foreground">by @{log.user}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{log.time}</span>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* View User Modal */}
      <ViewUserModal
        user={viewUser}
        profileImages={selectedUserProfileImages}
        onClose={() => setViewUser(null)}
        objectStorageBaseUrl={objectStorageBaseUrl}
      />

      {/* Edit User Modal */}
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