import { api } from './api';

export const userService = {
  getMe: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  uploadProfileImage: async (file) => {
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

  getProfileImageData: async (imageId) => {
    const response = await api.get(`/user/profile-images/${imageId}/data`, {
      responseType: 'blob', // Important for image data
    });
    return response.data;
  },

  deleteProfileImage: async (imageId) => {
    const response = await api.delete(`/user/profile-images/${imageId}`);
    return response.data;
  },

  setActiveProfileImage: async (imageId) => {
    const response = await api.put(`/user/profile-images/${imageId}/set-active`);
    return response.data;
  },

  updatePublicKey: async (publicKey) => {
    const response = await api.put('/user/public-key', { public_key: publicKey });
    return response.data;
  },

  getPublicKey: async (userId) => {
    const response = await api.get(`/user/public-key/${userId}`);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/delete');
    return response.data;
  },

  // Admin Endpoints
  getAllUsers: async () => {
    const response = await api.get('/user/all');
    return response.data;
  },

  adminDeleteUser: async (userId) => {
    const response = await api.delete(`/user/admin/delete/${userId}`);
    return response.data;
  },

  adminEditUser: async (userId, userData, file) => {
    const formData = new FormData();
    if (userData.role) {
      formData.append('role', userData.role);
    }
    if (userData.account_confirmed !== undefined) {
      formData.append('account_confirmed', userData.account_confirmed);
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

  adminGetUserProfileImages: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/profile-images`);
    return response.data;
  },

  adminGetUserProfileImageData: async (userId, imageId) => {
    const response = await api.get(`/admin/users/${userId}/profile-images/${imageId}/data`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
