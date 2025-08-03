import { UserResponseAdminDto } from '@/types/user';
import { api } from './api';

export const userService = {
  getMe: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/user/profile-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProfileImages: async () => {
    const response = await api.get('/user/profile-images');
    return response.data;
  },

  getProfileImageData: async (imageId: string) => {
    const response = await api.get(`/user/profile-images/${imageId}/data`, {
      responseType: 'blob', // Important for image data
    });
    return response.data;
  },

  deleteProfileImage: async (imageId: string) => {
    const response = await api.delete(`/user/profile-images/${imageId}`);
    return response.data;
  },

  setActiveProfileImage: async (imageId: string) => {
    const response = await api.put(`/user/profile-images/${imageId}/set-active`);
    return response.data;
  },

  updatePublicKey: async (publicKey: string) => {
    const response = await api.put('/user/public-key', { public_key: publicKey });
    return response.data;
  },

  getPublicKey: async (userId: string) => {
    const response = await api.get(`/user/public-key/${userId}`);
    return response.data;
  },

  updateBio: async (bio: string | null) => {
    const formData = new FormData();
    if (bio !== null) {
      formData.append('bio', bio);
    }
    const response = await api.put('/user/me/bio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/delete');
    return response.data;
  },

  // Admin Endpoints
  getAllUsers: async (): Promise<UserResponseAdminDto[]> => {
    const response = await api.get('/user/all');
    return response.data;
  },

  adminDeleteUser: async (userId: string) => {
    const response = await api.delete(`/user/admin/delete/${userId}`);
    return response.data;
  },

  adminEditUser: async (userId: string, userData: { role?: string; account_confirmed?: boolean; bio?: string | null }, file?: File) => {
    const formData = new FormData();
    if (userData.role) {
      formData.append('role', userData.role);
    }
    if (userData.account_confirmed !== undefined) {
      formData.append('account_confirmed', String(userData.account_confirmed));
    }
    if (userData.bio !== undefined) {
      formData.append('bio', userData.bio || ''); // Send empty string if bio is null
    }
    if (file) {
      formData.append('file', file);
    }

    const response = await api.put(`/user/admin/edit?user_id=${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  adminGetUserProfileImages: async (userId: string) => {
    const response = await api.get(`/user/admin/users/${userId}/profile-images`);
    return response.data;
  },

  adminGetUserProfileImageData: async (userId: string, imageId: string) => {
    const response = await api.get(`/admin/users/${userId}/profile-images/${imageId}/data`, {
      responseType: 'blob',
    });
    return response.data;
  },

  searchUsers: async (username: string) => {
    const response = await api.get(`/user/search?username=${username}`);
    return response.data;
  },

  uploadEncryptedPrivateKeyBackup: async (encryptedData: { encrypted_private_key: string; salt: string; iv: string; password: string }) => {
    const response = await api.put('/user/private-key-backup', encryptedData);
    return response.data;
  },

  getEncryptedPrivateKeyBackup: async () => {
    const response = await api.get('/user/private-key-backup');
    return response.data;
  },

  recoverPrivateKeyBackup: async (password: string) => {
    const response = await api.post('/user/private-key-backup', { password });
    return response.data;
  },
};