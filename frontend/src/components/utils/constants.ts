export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
 
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SESSION: '/session/:id',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
 
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
  THEME: 'theme',
} as const;
 
export const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
] as const;