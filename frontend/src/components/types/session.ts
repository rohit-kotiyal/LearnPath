export enum SessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
}
 
export interface Session {
  id: string;
  passkey: string;
  mentor_id: string;
  mentor_name: string;
  student_id?: string;
  student_name?: string;
  status: SessionStatus;
  code_content: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at?: string;
}
 
export interface CreateSessionData {
  mentor_id: string;
  mentor_name: string;
}
 
export interface JoinSessionData {
  session_id: string;
  passkey: string;
  student_name: string;
}