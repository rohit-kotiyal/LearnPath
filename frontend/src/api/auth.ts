import apiClient from './client';
import type { LoginData, RegisterData, AuthResponse, User } from '../components/types/user';
 
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
 
  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  },
 
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
 
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};