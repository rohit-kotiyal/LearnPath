import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sessionsApi } from '../../api/session';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
 
const createSessionSchema = z.object({
  mentor_name: z.string().min(1, 'Name is required').max(255),
});
 
type CreateSessionForm = z.infer<typeof createSessionSchema>;
 
interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (session: any) => void;
}
 
export default function CreateSessionModal({
  open,
  onClose,
  onSuccess,
}: CreateSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<any>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
 
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      mentor_name: user?.full_name || '',
    },
  });
 
  const onSubmit = async (data: CreateSessionForm) => {
    if (!user) return;
 
    setIsLoading(true);
    try {
      const session = await sessionsApi.createSession({
        mentor_id: user.id,
        mentor_name: data.mentor_name,
      });
 
      setCreatedSession(session);
      showToast({
        type: 'success',
        message: 'Session created successfully!',
      });
 
      if (onSuccess) {
        onSuccess(session);
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to create session',
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleClose = () => {
    setCreatedSession(null);
    reset();
    onClose();
  };
 
  return (
    <Modal open={open} onClose={handleClose} title="Create Session" size="md">
      {!createdSession ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="Enter your name"
            error={errors.mentor_name?.message}
            {...register('mentor_name')}
          />
 
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Session
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Session Created! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Share the passkey with your student to let them join.
            </p>
          </div>
 
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdSession.id}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(createdSession.id);
                    showToast({ type: 'success', message: 'Copied to clipboard!' });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passkey
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdSession.passkey}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-2xl font-bold text-center tracking-widest"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(createdSession.passkey);
                    showToast({ type: 'success', message: 'Passkey copied!' });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
 
          <Button fullWidth onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
 