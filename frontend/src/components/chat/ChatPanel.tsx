import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import { WebSocketMessageType } from '../types/websocket';
import ChatMessage from './ChatMessage';
import Button from '../ui/Button';
import Input from '../ui/Input';
 
interface Message {
  id: string;
  sender_id: string;
  message: string;
  username: string;
  timestamp: string;
}
 
interface ChatPanelProps {
  sessionId: string;
}
 
export default function ChatPanel({ sessionId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const { sendMessage, lastMessage } = useWebSocket(sessionId, user?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    if (lastMessage?.type === WebSocketMessageType.CHAT) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: lastMessage.sender_id || '',
        message: lastMessage.data?.message || '',
        username: lastMessage.data?.username || 'Unknown',
        timestamp: lastMessage.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [lastMessage]);
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
 
    sendMessage({
      type: WebSocketMessageType.CHAT,
      data: {
        message: inputValue,
        username: user?.full_name || 'Anonymous',
      },
    });
 
    setInputValue('');
  };
 
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
      </div>
 
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
 
      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button type="submit" size="md" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}