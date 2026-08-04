import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loader2, AlertCircle, Eye, EyeOff, Globe2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const registerMutation = useMutation<
    any,
    AxiosError<{ email?: string[]; password?: string[]; non_field_errors?: string[] }>,
    void
  >({
    mutationFn: async () => {
      const { data } = await client.post('/auth/register/', { email, password, confirm_password: confirmPassword });
      return data;
    },
    onSuccess: async () => {
      try {
        const { data } = await client.post('/auth/login/', { email, password });
        login(data.access, data.refresh, email);
        navigate('/');
      } catch (err) {
        navigate('/login');
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!hasMinLength) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      setValidationError('Passwords do not match.');
      return;
    }

    registerMutation.mutate();
  };

  const renderApiError = () => {
    if (!registerMutation.isError) return null;
    const errors = registerMutation.error?.response?.data;
    if (!errors) return 'An unexpected error occurred during registration.';
    
    if (errors.email) return `Email: ${errors.email[0]}`;
    if (errors.password) return `Password: ${errors.password[0]}`;
    if (errors.non_field_errors) return errors.non_field_errors[0];
    
    return 'Failed to create account.';
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-50 flex-col justify-center items-center p-12 border-r border-neutral-200">
        <Globe2 className="h-16 w-16 text-primary-500 mb-6" />
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">DutyWise</h1>
        <p className="text-neutral-500 text-lg max-w-sm text-center">
          Join DutyWise to save your calculations and build your importing history.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8 lg:text-left">
            <div className="flex lg:hidden justify-center items-center gap-2 mb-6">
              <Globe2 className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">DutyWise</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Create an Account</h2>
            <p className="text-sm text-neutral-500 mt-2">Sign up to save your calculations</p>
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
            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                iconRight={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                onIconRightClick={() => setShowPassword(!showPassword)}
              />
            </div>
            
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type your password again"
              required
              iconRight={showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onIconRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Password Validation Hints */}
            <div className="flex flex-col gap-2 mt-1">
              <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${password.length === 0 ? 'text-neutral-500' : (hasMinLength ? 'text-green-600' : 'text-neutral-500')}`}>
                {password.length > 0 && hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                At least 8 characters
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${confirmPassword.length === 0 ? 'text-neutral-500' : (passwordsMatch ? 'text-green-600' : 'text-neutral-500')}`}>
                {confirmPassword.length > 0 && passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                Passwords match
              </div>
            </div>

            {(validationError || registerMutation.isError) && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError || renderApiError()}</span>
              </div>
            )}

            <Button type="submit" disabled={registerMutation.isPending || !email || !hasMinLength || !passwordsMatch} className="w-full mt-2 h-11">
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="text-center lg:text-left text-sm text-neutral-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
