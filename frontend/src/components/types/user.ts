export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'mentor' | 'student';
  created_at: string;
}
 
export interface LoginData {
  email: string;
  password: string;
}
 
export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: 'mentor' | 'student';
}
 
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
 