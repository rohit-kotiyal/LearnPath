import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Video, VideoOff, Mic, MicOff, Copy, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import CodeEditor from '../../components/editor/CodeEditor';
import ChatPanel from '../../components/chat/ChatPanel';
import VideoCall from '../../components/video/VideoCall';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { sessionsApi } from '../../api/session';
import { Session as SessionType, SessionStatus } from '../types/session';
import { WebSocketMessageType } from '../types/websocket';

export default function Session() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [session, setSession] = useState<SessionType | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Safe WebSocket usage
  const { isConnected, sendMessage } = useWebSocket(
    id ?? '',
    user?.id ?? ''
  );

  // Fixed dependency issue using useCallback
  const loadSession = useCallback(async () => {
    if (!id) return;

    try {
      const data = await sessionsApi.getAllSessions();

      const currentSession = data.sessions.find(
        (s: SessionType) => s.id === id
      );

      if (currentSession) {
        setSession(currentSession);
        setCode(currentSession.code_content || '');
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to load session' });
    }
  }, [id, showToast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    sendMessage({
      type: WebSocketMessageType.CODE_UPDATE, // ✅ FIXED
      data: { code: newCode, language },
    });
  };

  const handleEndSession = async () => {
    if (!id || !session) return;

    try {
      await sessionsApi.endSession(id);
      showToast({ type: 'success', message: 'Session ended' });
      navigate('/dashboard');
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to end session' });
    }
  };

  const copySessionInfo = async () => {
    if (!session) return;

    const info = `Session ID: ${session.id}\nPasskey: ${session.passkey}`;

    try {
      await navigator.clipboard.writeText(info);
      showToast({ type: 'success', message: 'Session info copied!' });
    } catch {
      showToast({ type: 'error', message: 'Failed to copy' });
    }
  };

  // Handle missing id safely
  if (!id) {
    return <div className="p-4">Invalid session</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  const isMentor = session.mentor_id === user?.id;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {session.mentor_name}
              {session.student_name && ` & ${session.student_name}`}
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  session.status === SessionStatus.ACTIVE
                    ? 'success'
                    : 'warning'
                }
                size="sm"
              >
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>

              <button
                onClick={copySessionInfo}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy Info
              </button>

              {/* Chat Toggle (fixes unused setShowChat) */}
              <button
                onClick={() => setShowChat((prev) => !prev)}
                className="text-xs text-blue-500 hover:underline"
              >
                Toggle Chat
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isVideoOn ? 'primary' : 'ghost'}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              variant={isMicOn ? 'primary' : 'ghost'}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            {isMentor && (
              <Button size="sm" variant="danger" onClick={handleEndSession}>
                <PhoneOff className="w-4 h-4 mr-2" />
                End Session
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {(isVideoOn || isMicOn) && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <VideoCall sessionId={id} isVideoOn={isVideoOn} isMicOn={isMicOn} />
          </div>
        )}

        <div className="flex-1">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {showChat && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <ChatPanel sessionId={id} />
          </div>
        )}
      </div>
    </div>
  );
}