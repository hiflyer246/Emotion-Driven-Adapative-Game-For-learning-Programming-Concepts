import api from './api';

export const register = async (email, password, username) => {
  const response = await api.post('/api/auth/register', {
    email,
    password,
    username,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};