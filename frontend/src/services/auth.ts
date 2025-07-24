import { api } from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/user/login', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const formData = new FormData();
    for (const key in userData) {
      if (userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    }
    // If there's a file, append it
    if (userData.file) {
      formData.append('file', userData.file);
    }

    const response = await api.post('/user/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  confirmAccount: async (token) => {
    const response = await api.get(`/user/confirm-account?token=${token}`);
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post('/user/request-password-reset', { email });
    return response.data;
  },

  resetPassword: async (token, new_password, confirm_password) => {
    const response = await api.post('/user/reset-password', { token, new_password, confirm_password });
    return response.data;
  },
};
