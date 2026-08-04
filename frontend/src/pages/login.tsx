import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loader2, AlertCircle, Eye, EyeOff, Globe2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation<
    { access: string; refresh: string },
    AxiosError<{ detail?: string; non_field_errors?: string[] }>,
    void
  >({
    mutationFn: async () => {
      const { data } = await client.post('/auth/login/', { email, password });
      return data;
    },
    onSuccess: (data) => {
      login(data.access, data.refresh, email);
      navigate('/');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email && password) {
      mutation.mutate();
    }
  };

  const errorMessage = mutation.error?.response?.data?.detail 
    || mutation.error?.response?.data?.non_field_errors?.[0] 
    || 'Invalid credentials or an error occurred.';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Brand (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-50 flex-col justify-center items-center p-12 border-r border-neutral-200">
        <Globe2 className="h-16 w-16 text-primary-500 mb-6" />
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">DutyWise</h1>
        <p className="text-neutral-500 text-lg max-w-sm text-center">
          Know exactly what you'll pay before your package arrives.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8 lg:text-left">
            {/* Mobile logo only */}
            <div className="flex lg:hidden justify-center items-center gap-2 mb-6">
              <Globe2 className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">DutyWise</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-neutral-500 mt-2">Log in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              iconRight={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onIconRightClick={() => setShowPassword(!showPassword)}
            />

            {mutation.isError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" disabled={mutation.isPending || !email || !password} className="w-full mt-2 h-11">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>

          <p className="text-center lg:text-left text-sm text-neutral-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
