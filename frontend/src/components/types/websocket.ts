export enum WebSocketMessageType {
  CODE_UPDATE = 'code_update',
  CHAT = 'chat',
  CURSOR_MOVE = 'cursor_move',
  WEBRTC_SIGNAL = 'webrtc_signal',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SESSION_STATE = 'session_state',
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error',
}
 
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: any;
  sender_id?: string;
  timestamp?: string;
}
 
export interface CodeUpdateMessage {
  code: string;
  language?: string;
  cursor_position?: { line: number; column: number };
}
 
export interface ChatMessage {
  message: string;
  username: string;
}