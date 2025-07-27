import { UserResponseAdminDto, UserRole } from "@/types/user";
import { UserImageResponseDto } from "@/types/userImage";

export interface EditUserModalProps {
  selectedUser: UserResponseAdminDto;
  selectedUserProfileImages: UserImageResponseDto[];
  editRole: UserRole;
  setEditRole: (role: UserRole) => void;
  editAccountConfirmed: boolean;
  setEditAccountConfirmed: (confirmed: boolean) => void;
  editProfileImage: File | null;
  setEditProfileImage: (file: File | null) => void;
  editBio: string | null;
  setEditBio: (bio: string | null) => void;
  handleEditUser: (e: React.FormEvent) => void;
  onClose: () => void;
  objectStorageBaseUrl: string;
}

export interface ViewUserModalProps {
  user: UserResponseAdminDto;
  profileImages: UserImageResponseDto[];
  onClose: () => void;
  objectStorageBaseUrl: string;
}
