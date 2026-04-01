import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { WebSocketMessage } from '../types/websocket';
 
export function useWebSocket(sessionId: string, userId: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
 
  const connect = useCallback(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || !sessionId) return;
 
    try {
      const wsUrl = `${WS_BASE_URL}/ws/${sessionId}?token=${token}`;
      ws.current = new WebSocket(wsUrl);
 
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
 
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
 
      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Auto-reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };
 
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [sessionId]);
 
  useEffect(() => {
    connect();
 
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);
 
  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'sender_id' | 'timestamp'>) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        ...message,
        sender_id: userId,
      }));
    }
  }, [isConnected, userId]);
 
  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}