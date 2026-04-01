import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sessionsApi } from '../../api/session';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
 
const joinSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  passkey: z.string().min(6, 'Passkey must be at least 6 characters').max(10),
  student_name: z.string().min(1, 'Name is required').max(255),
});
 
type JoinSessionForm = z.infer<typeof joinSessionSchema>;
 
interface JoinSessionModalProps {
  open: boolean;
  onClose: () => void;
}
 
export default function JoinSessionModal({ open, onClose }: JoinSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
 
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinSessionForm>({
    resolver: zodResolver(joinSessionSchema),
    defaultValues: {
      student_name: user?.full_name || '',
    },
  });
 
  const onSubmit = async (data: JoinSessionForm) => {
    setIsLoading(true);
    try {
      await sessionsApi.joinSession(data);
      
      showToast({
        type: 'success',
        message: 'Joined session successfully!',
      });
 
      reset();
      onClose();
      
      // Navigate to session page
      navigate(`/session/${data.session_id}`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to join session';
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleClose = () => {
    reset();
    onClose();
  };
 
  return (
    <Modal open={open} onClose={handleClose} title="Join Session" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Session ID"
          placeholder="Enter session ID"
          error={errors.session_id?.message}
          {...register('session_id')}
        />
 
        <Input
          label="Passkey"
          placeholder="Enter passkey"
          error={errors.passkey?.message}
          {...register('passkey')}
          maxLength={10}
        />
 
        <Input
          label="Your Name"
          placeholder="Enter your name"
          error={errors.student_name?.message}
          {...register('student_name')}
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
            Join Session
          </Button>
        </div>
      </form>
    </Modal>
  );
}