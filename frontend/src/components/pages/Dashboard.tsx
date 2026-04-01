import { useState, useEffect } from 'react';
import { Plus, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import BottomNav from '../ui//BottomNav';
import CreateSessionModal from '../session/CreateSessionModal';
import JoinSessionModal from '../session/JoinSessionModal';
import SessionList from '../session/SessionList';
import { sessionsApi } from '../../api/session';
import { Session } from '../types/session';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
 
export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
 
  useEffect(() => {
    loadSessions();
  }, []);
 
  const loadSessions = async () => {
    try {
      const data = await sessionsApi.getAllSessions();
      setSessions(data.sessions || []);
    } catch (error: any) {
      showToast({
        type: 'error',
        message: 'Failed to load sessions',
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleCreateSuccess = (session: Session) => {
    setSessions([session, ...sessions]);
    setCreateModalOpen(false);
  };
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                LearnPath
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Welcome back, {user?.full_name}!
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
 
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => setCreateModalOpen(true)}
              className="justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Session
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setJoinModalOpen(true)}
              className="justify-center"
            >
              Join Session
            </Button>
          </div>
 
          {/* Session History */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Session History
              </h2>
              <Button variant="ghost" size="sm" onClick={loadSessions}>
                Refresh
              </Button>
            </div>
            <SessionList sessions={sessions} isLoading={isLoading} />
          </Card>
        </div>
      </main>
 
      {/* Modals */}
      <CreateSessionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <JoinSessionModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
 
      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
}
 