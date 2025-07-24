import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  User, 
  Upload, 
  Trash2, 
  Star, 
  Settings, 
  Key,
  LogOut,
  MessageCircle,
  Coffee,
  Edit3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileImages, setProfileImages] = useState<any[]>([]);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = await userService.getMe();
      setCurrentUser(user);
      const images = await userService.getProfileImages();
      setProfileImages(images);
      if (user.public_key) {
        setPublicKey(user.public_key);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile data",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
      handleLogout();
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileImageFile) {
      toast({
        title: "No file selected",
        description: "Please choose an image to upload.",
        variant: "destructive",
      });
      return;
    }
    try {
      await userService.uploadProfileImage(newProfileImageFile);
      toast({
        title: "Image Uploaded",
        description: "Profile image has been successfully uploaded.",
      });
      setNewProfileImageFile(null);
      fetchUserProfile(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSetActiveImage = async (imageId: string) => {
    try {
      await userService.setActiveProfileImage(imageId);
      toast({
        title: "Image Set Active",
        description: "Profile image has been set as active.",
      });
      fetchUserProfile(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Failed to Set Active",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await userService.deleteProfileImage(imageId);
      toast({
        title: "Image Deleted",
        description: "Profile image has been successfully deleted.",
      });
      fetchUserProfile(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePublicKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updatePublicKey(publicKey);
      toast({
        title: "Public Key Updated",
        description: "Your public key has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      handleLogout();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile data...</div>; // Or a loading spinner
  }

  const activeProfileImage = profileImages.find(img => img.is_active);

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
              <h1 className="text-xl font-crimson font-semibold">Profile Settings</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex"
              >
                Back to Chat
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
          <Card className="card-cozy text-center sticky top-24 bg-card dark:bg-card-dark text-card-foreground dark:text-card-foreground-dark">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24 border-4 border-accent/20">
                  <AvatarImage src={activeProfileImage ? `${import.meta.env.VITE_API_BASE_URL}user/profile-images/${activeProfileImage.id}/data` : "/placeholder.svg"} alt={currentUser.username} />
                  <AvatarFallback className="text-2xl font-crimson bg-accent/10 text-accent">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {activeProfileImage && (
                  <div className="absolute -bottom-1 -right-1 bg-accent p-1 rounded-full">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="font-crimson font-semibold text-lg mb-1">@{currentUser.username}</h3>
              <p className="text-sm text-muted-foreground mb-3">{currentUser.email}</p>
              
              <div className="flex justify-center mb-4">
                <Badge variant={currentUser.role === "admin" ? "default" : "secondary"} className="capitalize">
                  {currentUser.role}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <Coffee className="h-4 w-4" />
                  <span>Member since {new Date(currentUser.created_at).getFullYear()}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${currentUser.account_confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>{currentUser.account_confirmed ? 'Verified' : 'Pending'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Images</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="card-cozy">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="h-5 w-5 text-accent" />
                    <h2 className="text-xl font-crimson font-semibold">Profile Information</h2>
                  </div>
                  
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={currentUser.username} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={currentUser.email} disabled />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea 
                        id="bio"
                        className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        defaultValue={currentUser.bio || ""}
                        disabled // Bio is not yet editable via API
                      />
                    </div>
                    
                    <Button type="submit" className="btn-cozy" disabled>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images">
                <Card className="card-cozy">
                  <div className="flex items-center space-x-3 mb-6">
                    <Upload className="h-5 w-5 text-accent" />
                    <h2 className="text-xl font-crimson font-semibold">Profile Images</h2>
                    <Badge variant="outline">{profileImages.length}/5</Badge>
                  </div>
                  
                  <div className="space-y-6">
                    <form onSubmit={handleUploadImage} className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Upload a new profile image</p>
                      <Input 
                        id="new-profile-picture" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setNewProfileImageFile(e.target.files ? e.target.files[0] : null)}
                        className="hidden" // Hide default input
                      />
                      <Label htmlFor="new-profile-picture" className="btn-accent cursor-pointer">
                        {newProfileImageFile ? newProfileImageFile.name : "Choose File"}
                      </Label>
                      {newProfileImageFile && (
                        <Button type="submit" className="btn-cozy ml-2">
                          Upload
                        </Button>
                      )}
                    </form>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {profileImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL}user/profile-images/${image.id}/data`} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {image.is_active && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-accent text-accent-foreground">
                                <Star className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            {!image.is_active && (
                              <Button size="sm" variant="secondary" onClick={() => handleSetActiveImage(image.id)}>
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this profile image? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteImage(image.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <Card className="card-cozy">
                    <div className="flex items-center space-x-3 mb-6">
                      <Key className="h-5 w-5 text-accent" />
                      <h2 className="text-xl font-crimson font-semibold">Change Password</h2>
                    </div>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" disabled />
                      </div>
                      <Button type="submit" className="btn-cozy" disabled>
                        Update Password
                      </Button>
                    </form>
                  </Card>

                  <Card className="card-cozy">
                    <div className="flex items-center space-x-3 mb-6">
                      <Key className="h-5 w-5 text-accent" />
                      <h2 className="text-xl font-crimson font-semibold">Public Key</h2>
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleUpdatePublicKey}>
                      <div className="space-y-2">
                        <Label htmlFor="public-key">Public Key (for encryption)</Label>
                        <textarea 
                          id="public-key"
                          className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none font-mono text-sm"
                          rows={4}
                          placeholder="Enter your public key..."
                          value={publicKey}
                          onChange={(e) => setPublicKey(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="btn-cozy">
                        Update Public Key
                      </Button>
                    </form>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="card-cozy">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-5 w-5 text-accent" />
                    <h2 className="text-xl font-crimson font-semibold">Account Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;