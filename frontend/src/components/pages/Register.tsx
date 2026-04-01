import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, Users, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { registerSchema } from '../utils/validators';
 
type RegisterForm = z.infer<typeof registerSchema>;
 
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'student' | null>(null);
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
 
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
 
  const handleRoleSelect = (role: 'mentor' | 'student') => {
    setSelectedRole(role);
    setValue('role', role);
  };
 
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      showToast({
        type: 'success',
        message: 'Account created successfully! Welcome to LearnPath!',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      showToast({
        type: 'error',
        message,
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
            Join LearnPath
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account and start coding together
          </p>
        </div>
 
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              I want to join as a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('mentor')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  selectedRole === 'mentor'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <GraduationCap
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'mentor'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    selectedRole === 'mentor'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Mentor
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Teach & guide
                </p>
              </button>
 
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  selectedRole === 'student'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <Users
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'student'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    selectedRole === 'student'
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Student
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Learn & grow
                </p>
              </button>
            </div>
            {errors.role && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>
 
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
 
          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
 
          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            helperText="Must be at least 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />
 
          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
 
          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Create Account
          </Button>
        </form>
 
        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
 