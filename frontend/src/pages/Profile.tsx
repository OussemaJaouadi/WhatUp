import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Trash2, 
  Star, 
  Settings, 
  Key,
  User as UserIcon,
  Download,
  RefreshCcw,
  Copy,
  Check,
  Shield,
  Camera,
  Edit3,
  Eye,
  AlertTriangle
} from "lucide-react";
import { UserResponseDto } from "@/types/user";
import { UserImageResponseDto } from "@/types/userImage";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/user";
import { useToast } from "@/components/ui/use-toast";
import { getObjectStorageBaseUrl } from "@/lib/env";
import { authUtils } from "@/lib/authUtils";
import * as cryptoUtils from "@/lib/cryptoUtils";
import { keyStorage } from "@/lib/keyStorage";
import { BackupPrivateKeyModal, RecoverPrivateKeyModal, AutoBackupModal } from "@/components/modals";

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
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shouldTriggerBackup, setShouldTriggerBackup] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
        title: "Image uploaded successfully",
        description: "Your profile image has been updated.",
      });
      setNewProfileImageFile(null);
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSetActiveImage = async (imageId: string) => {
    try {
      await userService.setActiveProfileImage(imageId);
      toast({
        title: "Profile image updated",
        description: "This image is now your active profile picture.",
      });
      fetchUserProfile();
    } catch (error) {
      toast({
        title: "Failed to update",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await userService.deleteProfileImage(imageId);
      toast({
        title: "Image deleted",
        description: "Profile image has been removed.",
      });
      fetchUserProfile();
    } catch (error) {
      toast({
        title: "Deletion failed",
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
        title: "Bio updated",
        description: "Your profile bio has been saved.",
      });
      fetchUserProfile();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      handleLogout();
    } catch (error) {
      toast({
        title: "Deletion failed",
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
      await keyStorage.savePrivateKey(currentUser!.id, keyPair.privateKey);
      setPublicKey(publicKeyPem);
      toast({
        title: "Encryption keys generated",
        description: "Your new encryption keys are ready. Consider creating a backup.",
      });
      setShouldTriggerBackup(true);
    } catch (error) {
      console.error("Error generating or uploading keys:", error);
      toast({
        title: "Key generation failed",
        description: error.response?.data?.detail || "An error occurred during key generation.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const truncateKey = (key: string, startChars: number = 20, endChars: number = 20) => {
    if (!key || key.length <= startChars + endChars + 10) return key;
    return `${key.substring(0, startChars)}...${key.substring(key.length - endChars)}`;
  };

  const handleCopyPublicKey = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Public key has been copied.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy the public key.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading profile...</div>
      </div>
    );
  }

  const activeProfileImage = profileImages.find(img => img.is_active);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-900 dark:via-amber-900/10 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <img
                    src={activeProfileImage ? `${objectStorageBaseUrl}/${activeProfileImage.image_key}` : "/default-avatar.svg"}
                    alt={currentUser.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                  />
                  {activeProfileImage && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 p-1.5 rounded-full border-2 border-white dark:border-slate-800">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">
                  @{currentUser.username}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{currentUser.email}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${currentUser.account_confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-slate-600 dark:text-slate-400">
                      {currentUser.account_confirmed ? 'Verified Account' : 'Pending Verification'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Member since {new Date(currentUser.created_at).getFullYear()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <TabsTrigger value="profile" className="flex items-center space-x-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/20 dark:data-[state=active]:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center space-x-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/20 dark:data-[state=active]:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Photos</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/20 dark:data-[state=active]:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/20 dark:data-[state=active]:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-amber-600" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your personal information and bio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={currentUser.username} 
                          disabled 
                          className="bg-slate-50 dark:bg-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={currentUser.email} 
                          disabled 
                          className="bg-slate-50 dark:bg-slate-700"
                        />
                      </div>
                    </div>

                    <form onSubmit={handleUpdateBio} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Update Bio
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-5 w-5 text-amber-600" />
                        <span>Profile Photos</span>
                      </div>
                      <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                        {profileImages.length}/5
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Upload and manage your profile pictures
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {newProfileImageFile ? newProfileImageFile.name : "Upload a new profile photo"}
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <Label htmlFor="new-profile-picture">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>Choose File</span>
                          </Button>
                        </Label>
                        <Input
                          id="new-profile-picture" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setNewProfileImageFile(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                        {newProfileImageFile && (
                          <Button onClick={handleUploadImage} className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Images Grid */}
                    {profileImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profileImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                              <img
                                src={`${objectStorageBaseUrl}/${image.image_key}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {image.is_active && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-amber-600 text-white">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Active
                                </Badge>
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="secondary">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-0">
                                  <img 
                                    src={`${objectStorageBaseUrl}/${image.image_key}`} 
                                    alt="Preview" 
                                    className="w-full h-auto"
                                  />
                                </DialogContent>
                              </Dialog>
                              
                              {!image.is_active && (
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  onClick={() => handleSetActiveImage(image.id)}
                                >
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
                                    <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this profile photo? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteImage(image.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No profile photos yet</p>
                        <p className="text-sm">Upload your first photo above</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                {/* Encryption Keys */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="h-5 w-5 text-amber-600" />
                      <span>Encryption Keys</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your end-to-end encryption keys for secure messaging
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!currentUser.public_key ? (
                      <div className="text-center py-6">
                        <Shield className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          No encryption keys found
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Generate encryption keys to enable secure messaging
                        </p>
                        <Button
                          onClick={handleGenerateAndUploadKeys}
                          disabled={isGeneratingKeys}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {isGeneratingKeys ? (
                            <>
                              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2" />
                              Generate Keys
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">
                                Encryption Enabled
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-300">
                                Your messages are secured with end-to-end encryption
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Public Key</Label>
                            <Button
                              onClick={handleCopyPublicKey}
                              variant="outline"
                              size="sm"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-4 w-4 mr-1 text-green-600" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                            <code className="text-sm text-slate-600 dark:text-slate-300 font-mono break-all">
                              {truncateKey(publicKey)}
                            </code>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleGenerateAndUploadKeys} 
                            variant="outline"
                            disabled={isGeneratingKeys}
                          >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Management */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Key Backup & Recovery</CardTitle>
                    <CardDescription>
                      Backup your private key to access messages across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Backup Private Key</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Create a secure backup of your private key
                        </p>
                        <BackupPrivateKeyModal currentUserId={currentUser.id} />
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Recover Private Key</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Restore your private key from backup
                        </p>
                        <RecoverPrivateKeyModal currentUserId={currentUser.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Password Change Warning */}
                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Password Change Notice
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          If you change your account password and used it to encrypt your private key backup, 
                          you'll need to update your backup to maintain access to old messages.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <span>Account Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Danger Zone */}
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
                      <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
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
                              account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Auto Backup Modal */}
      <AutoBackupModal 
        currentUserId={currentUser.id}
        isOpen={shouldTriggerBackup}
        onClose={() => setShouldTriggerBackup(false)}
      />
    </div>
  );
};

export default Profile;