import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Eye, Crown, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ViewUserModalProps } from "@/types/modal";

const ViewUserModal: React.FC<ViewUserModalProps> = ({ 
  user, 
  profileImages, 
  onClose, 
  objectStorageBaseUrl 
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">User Details</h2>
              <span className="text-slate-500 dark:text-slate-400">@{user.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - User Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={user.active_avatar_url ? `${objectStorageBaseUrl}/${user.active_avatar_url}` : "/default-avatar.svg"}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    @{user.username}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {user.role === "admin" && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge variant={user.account_confirmed ? "default" : "secondary"}>
                      {user.account_confirmed ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bio</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {user.bio || "No bio provided"}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Role:</span>
                      <span className="text-slate-900 dark:text-slate-100 capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Status:</span>
                      <span className={user.account_confirmed ? "text-green-600" : "text-orange-600"}>
                        {user.account_confirmed ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Joined:</span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Images */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Profile Images</h4>
              {profileImages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <p className="text-sm">No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {profileImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                        <img
                          src={img.image_key ? `${objectStorageBaseUrl}/${img.image_key}` : "/default-avatar.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {img.is_active && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer">
                            <Eye className="h-6 w-6 text-white" />
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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewUserModal;