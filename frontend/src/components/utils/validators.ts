import { z } from 'zod';
 
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
 
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['mentor', 'student']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
 
export const createSessionSchema = z.object({
  mentor_name: z.string().min(1, 'Name is required').max(255),
});
 
export const joinSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  passkey: z.string().min(6).max(10),
  student_name: z.string().min(1, 'Name is required').max(255),
});
 
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000, 'Message too long'),
});
 