import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loader2, AlertCircle, Eye, EyeOff, Check, X, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export default function Profile() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Email form state
  const [email, setEmail] = useState('');
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // 1. Fetch Profile
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await client.get('/auth/me/');
      return data;
    }
  });

  // Sync profile email to state when loaded
  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile]);

  // 2. Update Email Mutation
  const updateEmailMutation = useMutation<
    any,
    AxiosError<{ email?: string[]; non_field_errors?: string[] }>,
    string
  >({
    mutationFn: async (newEmail) => {
      const { data } = await client.patch('/auth/me/', { email: newEmail });
      return data;
    },
    onSuccess: (data) => {
      // Update the local cache
      queryClient.setQueryData(['profile'], data);
    }
  });

  // 3. Change Password Mutation
  const changePasswordMutation = useMutation<
    any,
    AxiosError<{ current_password?: string[]; new_password?: string[]; non_field_errors?: string[] }>,
    void
  >({
    mutationFn: async () => {
      const { data } = await client.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword
      });
      return data;
    },
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccessMessage('Password updated successfully.');
      setTimeout(() => setPasswordSuccessMessage(''), 5000); // Auto dismiss
    }
  });

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email !== profile?.email && email.trim()) {
      updateEmailMutation.mutate(email);
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentPassword && hasMinLength && passwordsMatch) {
      setPasswordSuccessMessage('');
      changePasswordMutation.mutate();
    }
  };

  const renderEmailError = () => {
    if (!updateEmailMutation.isError) return null;
    const errors = updateEmailMutation.error?.response?.data;
    if (errors?.email) return errors.email[0];
    if (errors?.non_field_errors) return errors.non_field_errors[0];
    return 'Failed to update email.';
  };

  const renderPasswordError = () => {
    if (!changePasswordMutation.isError) return null;
    const errors = changePasswordMutation.error?.response?.data;
    if (errors?.current_password) return errors.current_password[0];
    if (errors?.new_password) return errors.new_password[0];
    if (errors?.non_field_errors) return errors.non_field_errors[0];
    return 'Failed to update password.';
  };

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertCircle size={20} />
        <span className="font-medium">Failed to load profile. Please try logging in again.</span>
      </div>
    );
  }

  const isEmailChanged = email !== profile?.email;
  const joinDate = profile?.date_joined 
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(profile.date_joined))
    : 'Unknown';

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-2xl mx-auto w-full pt-4">
      <div className="mb-2">
        <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Profile</h1>
        <p className="text-neutral-500 mt-2 font-medium">Manage your account details and password.</p>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-neutral-200">
        
        {/* Section 1: Account Details */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Account Details</h2>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5 max-w-md">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="text-sm font-medium text-neutral-500 pt-1">
              Member since {joinDate}
            </div>

            {updateEmailMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{renderEmailError()}</span>
              </div>
            )}
            
            {updateEmailMutation.isSuccess && !isEmailChanged && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 mt-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Email updated successfully.</span>
              </div>
            )}

            {isEmailChanged && (
              <Button 
                type="submit" 
                disabled={updateEmailMutation.isPending || !email.trim()} 
                className="mt-2 w-fit"
              >
                {updateEmailMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            )}
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5 max-w-md">
            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              iconRight={showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onIconRightClick={() => setShowCurrentPassword(!showCurrentPassword)}
            />
            
            <div className="flex flex-col gap-1.5">
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                iconRight={showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                onIconRightClick={() => setShowNewPassword(!showNewPassword)}
              />
            </div>

            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type your new password again"
              required
              iconRight={showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onIconRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Password Validation Hints */}
            {(newPassword.length > 0 || confirmPassword.length > 0) && (
              <div className="flex flex-col gap-2 mt-1">
                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${newPassword.length === 0 ? 'text-neutral-500' : (hasMinLength ? 'text-green-600' : 'text-neutral-500')}`}>
                  {newPassword.length > 0 && hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${confirmPassword.length === 0 ? 'text-neutral-500' : (passwordsMatch ? 'text-green-600' : 'text-neutral-500')}`}>
                  {confirmPassword.length > 0 && passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                  Passwords match
                </div>
              </div>
            )}

            {changePasswordMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{renderPasswordError()}</span>
              </div>
            )}

            {passwordSuccessMessage && !changePasswordMutation.isError && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 mt-2 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccessMessage}</span>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending || !currentPassword || !hasMinLength || !passwordsMatch} 
              className="mt-2 w-fit"
            >
              {changePasswordMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Section 3: Logout Action */}
      <div className="mt-4 pt-4 border-t border-transparent">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 w-fit"
        >
          <LogOut className="h-4 w-4" />
          Log Out completely
        </button>
      </div>

    </div>
  );
}
