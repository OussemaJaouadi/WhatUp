import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Edit3, CheckCircle, Eye, X } from "lucide-react";
import React, { useState } from "react";
import { UserRole } from "@/types/user";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { EditUserModalProps } from "@/types/modal";

const EditUserModal: React.FC<EditUserModalProps> = ({
  selectedUser,
  selectedUserProfileImages,
  editRole,
  setEditRole,
  editAccountConfirmed,
  setEditAccountConfirmed,
  editProfileImage,
  setEditProfileImage,
  editBio,
  setEditBio,
  handleEditUser,
  onClose,
  objectStorageBaseUrl,
}) => {
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string | null>(null);

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Edit User</h2>
              <span className="text-slate-500 dark:text-slate-400">@{selectedUser.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleEditUser} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - User Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <Label htmlFor="edit-account-status" className="font-medium">Account Verified</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">User can access all features</p>
                  </div>
                  <Switch
                    id="edit-account-status"
                    checked={editAccountConfirmed}
                    onCheckedChange={setEditAccountConfirmed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea
                    id="edit-bio"
                    value={editBio || ""}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="User bio..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Right Column - Profile Images */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Images</Label>
                  {selectedUserProfileImages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <p className="text-sm">No images found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedUserProfileImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                            <img
                              src={img.image_key ? `${objectStorageBaseUrl}/${img.image_key}` : "/default-avatar.svg"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {img.is_active && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full" />
                            </div>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl p-0">
                              <img 
                                src={img.image_key ? `${objectStorageBaseUrl}/${img.image_key}` : "/default-avatar.svg"} 
                                alt="Preview" 
                                className="w-full h-auto"
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-profile-picture">Upload New Profile Image</Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <Label htmlFor="edit-profile-picture" className="cursor-pointer">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {editProfileImage ? editProfileImage.name : "Click to upload new image"}
                      </span>
                    </Label>
                    <Input
                      id="edit-profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditProfileImage(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Edit3 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EditUserModal;