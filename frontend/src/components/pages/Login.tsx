import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { loginSchema } from '../utils/validators';
 
type LoginForm = z.infer<typeof loginSchema>;
 
export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
 
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data);
      showToast({
        type: 'success',
        message: 'Welcome back!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.response?.data?.detail || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to LearnPath
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn to code together, in real-time
          </p>
        </div>
 
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
 
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
 
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Sign In
          </Button>
        </form>
 
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
 