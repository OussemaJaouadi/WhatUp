import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, 
  Trash2, 
  Star, 
  Settings, 
  Key,
  LogOut,
  MessageCircle,
  Coffee,
  Edit3,
  Eye,
  User as UserIcon,
  Download,
  RefreshCcw
} from "lucide-react";
import { UserResponseAdminDto, UserResponseDto } from "@/types/user";
import { UserImageResponseDto } from "@/types/userImage";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { useToast } from "@/components/ui/use-toast";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { animate, createScope } from "animejs";
import { authUtils } from "@/lib/authUtils";
import * as cryptoUtils from "@/lib/cryptoUtils";
import { keyStorage } from "@/lib/keyStorage";

const objectStorageBaseUrl = getObjectStorageBaseUrl();

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  const [profileImages, setProfileImages] = useState<UserImageResponseDto[]>([]);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [bio, setBio] = useState("");
  const [backupPassword, setBackupPassword] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  const profileContainerRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!profileContainerRef.current) return;

    scope.current = createScope({ root: profileContainerRef.current }).add(() => {
      animate('.profile-card', {
        translateY: [40, 0],
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 600,
        ease: 'out(2)'
      });

      animate('.tab-trigger', {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: (el, i) => i * 80 + 200,
        duration: 500,
        ease: 'out(2)'
      });
    });

    return () => scope.current?.revert();
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      const user = await userService.getMe();
      setCurrentUser(user);
      setBio(user.bio || "");
      const images = await userService.getProfileImages();
      setProfileImages(images);
      if (user.public_key) {
        setPublicKey(user.public_key);
      }
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateBio(bio);
      toast({
        title: "Bio Updated",
        description: "Your bio has been successfully updated.",
      });
      fetchUserProfile();
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    authUtils.removeToken();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleGenerateAndUploadKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      const keyPair = await cryptoUtils.generateKeyPair();
      const publicKeyPem = keyPair.publicKey;
      await userService.updatePublicKey(publicKeyPem);
      await keyStorage.savePrivateKey(currentUser.id, keyPair.privateKey);
      setPublicKey(publicKeyPem);
      toast({
        title: "Keys Generated & Uploaded",
        description: "Your new encryption keys have been generated and public key uploaded.",
      });
    } catch (error) {
      console.error("Error generating or uploading keys:", error);
      toast({
        title: "Key Generation Failed",
        description: error.response?.data?.detail || "An error occurred during key generation/upload.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleBackupPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupPassword) {
      toast({
        title: "Password Required",
        description: "Please enter a password to encrypt your private key.",
        variant: "destructive",
      });
      return;
    }
    try {
      const privateKey = await keyStorage.getPrivateKey();
      if (!privateKey) {
        toast({
          title: "No Private Key Found",
          description: "Please generate your keys first.",
          variant: "destructive",
        });
        return;
      }
      const encryptedData = await cryptoUtils.encryptPrivateKey(privateKey, backupPassword);
      await userService.uploadPrivateKeyBackup(encryptedData);
      toast({
        title: "Private Key Backed Up",
        description: "Your private key has been securely backed up.",
      });
      setBackupPassword("");
    } catch (error) {
      console.error("Error backing up private key:", error);
      toast({
        title: "Backup Failed",
        description: error.response?.data?.detail || "An error occurred during private key backup.",
        variant: "destructive",
      });
    }
  };

  const handleRecoverPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your backup password.",
        variant: "destructive",
      });
      return;
    }
    try {
      const encryptedData = await userService.getPrivateKeyBackup();
      if (!encryptedData) {
        toast({
          title: "No Backup Found",
          description: "No private key backup found on the server.",
          variant: "destructive",
        });
        return;
      }
      const privateKey = await cryptoUtils.decryptPrivateKey(encryptedData, recoveryPassword);
      await keyStorage.savePrivateKey(privateKey);
      toast({
        title: "Private Key Recovered",
        description: "Your private key has been successfully recovered and stored locally.",
      });
      setRecoveryPassword("");
    } catch (error) {
      console.error("Error recovering private key:", error);
      toast({
        title: "Recovery Failed",
        description: error.response?.data?.detail || "An error occurred during private key recovery. Check your password.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-cozy-fade-in text-lg text-muted-foreground">Loading profile data...</div>
      </div>
    );
  }

  const activeProfileImage = profileImages.find(img => img.is_active);

  return (
    <div className="min-h-screen gradient-cozy dark:bg-[#181926] text-foreground flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8" ref={profileContainerRef}>
        <div className="grid lg:grid-cols-4 gap-8 h-full">
          {/* Profile Summary Card */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="card-cozy animate-cozy-fade-in bg-card/90 dark:bg-[#23243a] backdrop-blur-sm border border-border/70 dark:border-transparent shadow-cozy dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.30)] transition-colors text-center profile-card">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <img 
                      src={activeProfileImage ? `${objectStorageBaseUrl}/${activeProfileImage.image_key}` : "/placeholder.svg"} 
                      alt={currentUser.username} 
                      className="cursor-pointer"
                    />
                  </DialogTrigger>
                  <DialogContent className="p-0 bg-transparent flex items-center justify-center">
                    <img src={activeProfileImage ? `${objectStorageBaseUrl}/${activeProfileImage.image_key}` : "/placeholder.svg"} alt="Preview" className="max-w-full max-h-full" />
                  </DialogContent>
                </Dialog>
                {activeProfileImage && (
                  <div className="absolute -bottom-1 -right-1 bg-accent p-1 rounded-full">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-1">@{currentUser.username}</h3>
              <p className="text-sm text-muted-foreground mb-3">{currentUser.email}</p>              
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
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center space-x-2 tab-trigger">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center space-x-2 tab-trigger">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Images</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2 tab-trigger">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2 tab-trigger">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="card-cozy profile-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                  </div>

                  <form className="space-y-6" onSubmit={handleUpdateBio}>
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
                        className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none input-cozy"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="btn-primary">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images">
                <Card className="card-cozy profile-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <Upload className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Profile Images</h2>
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
                      <Label htmlFor="new-profile-picture" className="btn-primary cursor-pointer">
                        {newProfileImageFile ? newProfileImageFile.name : "Choose File"}
                      </Label>
                      {newProfileImageFile && (
                        <Button type="submit" className="btn-primary ml-2">
                          Upload
                        </Button>
                      )}
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {profileImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square overflow-hidden flex items-center justify-center">
                            <img
                              src={`${objectStorageBaseUrl}/${image.image_key}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {image.is_active && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-primary text-primary-foreground">
                                <Star className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                                <DialogContent className="p-0 bg-transparent flex items-center justify-center">
                                  <img src={`${objectStorageBaseUrl}/${image.image_key}`} alt="Preview" className="max-w-full max-h-full" />
                              </DialogContent>
                            </Dialog>
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
                  <Card className="card-cozy profile-card">
                    <div className="flex items-center space-x-3 mb-6">
                      <Key className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Change Password</h2>
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
                      <Button type="submit" className="btn-primary" disabled>
                        Update Password
                      </Button>
                    </form>
                  </Card>

                  {!currentUser.public_key ? (
                    <Card className="card-cozy profile-card">
                      <div className="flex items-center space-x-3 mb-6">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Generate Encryption Keys</h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        It looks like you don't have an encryption key pair yet. Generate one to enable end-to-end encrypted messaging.
                      </p>
                      <Button onClick={handleGenerateAndUploadKeys} className="btn-primary" disabled={isGeneratingKeys}>
                        {isGeneratingKeys ? (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Generating Keys...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Generate & Upload Keys
                          </>
                        )}
                      </Button>
                    </Card>
                  ) : (
                    <Card className="card-cozy profile-card">
                      <div className="flex items-center space-x-3 mb-6">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Your Public Key</h2>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="public-key">Public Key (for encryption)</Label>
                        <textarea
                          id="public-key"
                          className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none font-mono text-sm input-cozy"
                          rows={4}
                          value={publicKey}
                          readOnly
                        />
                      </div>
                    </Card>
                  )}

                  <Card className="card-cozy profile-card">
                    <div className="flex items-center space-x-3 mb-6">
                      <Key className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Private Key Backup</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Securely backup your private key to the server. You will need a password to encrypt it.
                    </p>
                    <form className="space-y-4" onSubmit={handleBackupPrivateKey}>
                      <div className="space-y-2">
                        <Label htmlFor="backup-password">Backup Password</Label>
                        <Input
                          id="backup-password"
                          type="password"
                          placeholder="Enter a strong password for backup"
                          value={backupPassword}
                          onChange={(e) => setBackupPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="btn-primary">
                        <Upload className="h-4 w-4 mr-2" />
                        Backup Private Key
                      </Button>
                    </form>
                  </Card>

                  <Card className="card-cozy profile-card">
                    <div className="flex items-center space-x-3 mb-6">
                      <Key className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Private Key Recovery</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recover your private key from the server using your backup password.
                    </p>
                    <form className="space-y-4" onSubmit={handleRecoverPrivateKey}>
                      <div className="space-y-2">
                        <Label htmlFor="recovery-password">Backup Password</Label>
                        <Input
                          id="recovery-password"
                          type="password"
                          placeholder="Enter your backup password"
                          value={recoveryPassword}
                          onChange={(e) => setRecoveryPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="btn-primary">
                        <Download className="h-4 w-4 mr-2" />
                        Recover Private Key
                      </Button>
                    </form>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="card-cozy profile-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Account Settings</h2>
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;