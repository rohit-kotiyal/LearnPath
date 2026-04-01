import apiClient from './client';
import type { Session, CreateSessionData, JoinSessionData } from '../components/types/session';
 
export const sessionsApi = {
  createSession: async (data: CreateSessionData): Promise<Session> => {
    const response = await apiClient.post<Session>('/sessions/create', data);
    return response.data;
  },
 
  getAllSessions: async (params?: {
    skip?: number;
    limit?: number;
    status_filter?: string;
  }): Promise<{ sessions: Session[] }> => {
    const response = await apiClient.get('/sessions/', { params });
    return response.data;
  },
 
  joinSession: async (data: JoinSessionData): Promise<any> => {
    const response = await apiClient.post('/sessions/join', data);
    return response.data;
  },
 
  endSession: async (sessionId: string): Promise<any> => {
    const response = await apiClient.post('/sessions/end', { session_id: sessionId });
    return response.data;
  },
 
  updateCode: async (sessionId: string, code: string): Promise<any> => {
    const response = await apiClient.put(`/sessions/code?session_id=${sessionId}`, {
      code_content: code,
    });
    return response.data;
  },
};