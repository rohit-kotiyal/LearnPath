import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sessionsApi } from '../../api/session';
import { useAuth } from '../hooks/useAuth';

export default function JoinSessionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  const sessionId = params.get('sessionId');
  const passkey = params.get('passkey');

  useEffect(() => {
    if (isLoading) return;

    if (!sessionId || !passkey) {
      navigate('/dashboard');
      return;
    }

    // Not logged in → save + redirect
    if (!isAuthenticated) {
      localStorage.setItem(
        'pending_join',
        JSON.stringify({ sessionId, passkey })
      );
      navigate('/login');
      return;
    }

    // Logged in → join
    const join = async () => {
      try {
        await sessionsApi.joinSession({
          session_id: sessionId,
          passkey,
          student_name: user?.full_name || 'Student',
        });

        navigate(`/session/${sessionId}`);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      }
    };

    join();
  }, [isAuthenticated, isLoading]);

  return <div className="p-4">Joining session...</div>;
}