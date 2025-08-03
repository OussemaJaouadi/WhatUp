import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Edit3, CheckCircle, Eye } from "lucide-react";
import React, { useState } from "react";
import { UserRole } from "@/types/user";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Switch } from "../ui/switch";

import { EditUserModalProps } from "@/types/modal";
import { Textarea } from "../ui/textarea";



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
  const [openPreview, setOpenPreview] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string | null>(null);

  if (!selectedUser) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="card-cozy w-full max-w-3xl dark:bg-card-dark dark:text-card-foreground-dark">
        <div className="flex items-center space-x-3 mb-6">
          <Edit3 className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-crimson font-semibold">Edit User</h2>
          <span className="ml-auto text-lg font-medium text-muted-foreground">@{selectedUser.username}</span>
        </div>
        <form className="space-y-4" onSubmit={handleEditUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                  <SelectTrigger id="edit-role" className="input-cozy">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/80">
                <Label htmlFor="edit-account-status" className="font-medium">Account Confirmed</Label>
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
                  placeholder="Enter user bio..."
                  rows={3}
                  className="input-cozy"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Images</Label>
                <div className="flex gap-3 mb-4 flex-wrap items-center justify-start">
                  {selectedUserProfileImages.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No images found.</div>
                  ) : (
                    selectedUserProfileImages.map((img) => (
                      <div
                        key={img.id}
                        className={`relative group flex flex-col items-center w-24`}
                      >
                        <Dialog>
                        <DialogTrigger asChild>
                          <div
                            className="relative cursor-pointer"
                            onClick={() => {
                              setCurrentPreviewImage(img.image_key ? `${objectStorageBaseUrl}/${img.image_key}` : "/default-avatar.svg");
                              setOpenPreview(true);
                            }}
                          >
                            <img
                              src={img.image_key ? `${objectStorageBaseUrl}/${img.image_key}` : "/default-avatar.svg"}
                              alt="Profile"
                              className={`h-20 w-20 rounded-xl object-cover border-2 ${img.is_active ? 'border-primary shadow-md glow-yellow' : 'border-border'} transition-all mb-1`}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-0 overflow-hidden">
                          <img src={currentPreviewImage || ""} alt="Preview" className="w-full h-auto object-contain" />
                        </DialogContent>
                      </Dialog>
                        {img.is_active && (
                          <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 text-xs flex items-center justify-center shadow-cozy">
                            <CheckCircle className="h-4 w-4" />
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">{img.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    ))
                  )}
                </div>
                <Label htmlFor="edit-profile-picture" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {editProfileImage ? editProfileImage.name : "Click to upload new profile image"}
                    </p>
                  </div>
                </Label>
                <Input
                  id="edit-profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditProfileImage(e.target.files ? e.target.files[0] : null)}
                  className="hidden input-cozy"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="btn-primary flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUserModal;
