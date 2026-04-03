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

  const { register, login } = useAuth();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    setValue,
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
      await register({
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
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-md">
            <Code2 className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join LearnPath
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start your journey as a mentor or student
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose your role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('mentor')}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  selectedRole === 'mentor'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <GraduationCap
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'mentor'
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                <p className="text-sm font-semibold">Mentor</p>
                <p className="text-xs text-gray-500">Teach & guide</p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  selectedRole === 'student'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Users
                  className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === 'student'
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                <p className="text-sm font-semibold">Student</p>
                <p className="text-xs text-gray-500">Learn & grow</p>
              </button>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Two Column Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              error={errors.full_name?.message}
              {...formRegister('full_name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...formRegister('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="Create password"
              error={errors.password?.message}
              {...formRegister('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              error={errors.confirmPassword?.message}
              {...formRegister('confirmPassword')}
            />
          </div>

          {/* Submit */}
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}


