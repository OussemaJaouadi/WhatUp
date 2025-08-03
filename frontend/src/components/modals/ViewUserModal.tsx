import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Eye } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

import { ViewUserModalProps } from "@/types/modal";



const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, profileImages, onClose, objectStorageBaseUrl }) => {
  const [openPreview, setOpenPreview] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string | null>(null);

  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="card-cozy w-full max-w-3xl dark:bg-card-dark dark:text-card-foreground-dark">
        <div className="flex items-center space-x-3 mb-6">
          <h2 className="text-xl font-crimson font-semibold">User Details</h2>
          <span className="ml-auto text-lg font-medium text-muted-foreground">@{user.username}</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : "/default-avatar.svg"}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-md"
                />
                <div>
                  <p className="font-bold text-xl">@{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Role: <span className="font-normal capitalize">{user.role}</span></p>
                <p className="font-semibold">Status: <span className={`font-normal ${user.account_confirmed ? "text-green-500" : "text-yellow-500"}`}>{user.account_confirmed ? "Confirmed" : "Pending"}</span></p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Bio</p>
                <p className="text-sm text-muted-foreground">{user.bio || "No bio provided."}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">Profile Images</p>
                <div className="flex gap-3 mb-4 flex-wrap items-center justify-start">
                  {profileImages.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No images found.</div>
                  ) : (
                    profileImages.map((img) => (
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
              </div>
            </div>
          </div>
        </div>
        <div className="flex pt-6">
          <Button className="btn-cozy flex-1" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ViewUserModal;
