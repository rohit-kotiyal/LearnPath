export interface User {
  id: string
  email: string
  full_name?: string
  role: 'mentor' | 'student'
  created_at: string
}

export interface Session {
  id: string
  mentor_id: string
  student_id: string | null
  status: 'waiting' | 'active' | 'ended'
  code_content: string
  start_time: string
  end_time?: string
}

export interface Message {
  id: string
  session_id: string
  sender_id: string
  message: string
  created_at: string
}