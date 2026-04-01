import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { WebSocketMessageType } from '../types/websocket';
 
export function useCodeSync(sessionId: string, userId: string, initialCode: string = '') {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState('javascript');
  const { isConnected, lastMessage, sendMessage } = useWebSocket(sessionId, userId);
 
  useEffect(() => {
    if (!lastMessage) return;
 
    switch (lastMessage.type) {
      case WebSocketMessageType.CODE_UPDATE:
        if (lastMessage.sender_id !== userId) {
          setCode(lastMessage.data?.code || '');
          if (lastMessage.data?.language) {
            setLanguage(lastMessage.data.language);
          }
        }
        break;
 
      case WebSocketMessageType.SESSION_STATE:
        setCode(lastMessage.data?.code_content || '');
        break;
    }
  }, [lastMessage, userId]);
 
  const updateCode = (newCode: string) => {
    setCode(newCode);
    sendMessage({
      type: WebSocketMessageType.CODE_UPDATE,
      data: { code: newCode, language },
    });
  };
 
  const updateLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    sendMessage({
      type: WebSocketMessageType.CODE_UPDATE,
      data: { code, language: newLanguage },
    });
  };
 
  return {
    code,
    language,
    isConnected,
    updateCode,
    updateLanguage,
  };
}