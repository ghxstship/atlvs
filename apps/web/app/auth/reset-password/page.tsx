'use client';


import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthForm, AuthInput, AuthLink } from '../_components/AuthForm';
import { ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Handle the auth callback from the email link
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };

    handleAuthCallback();
  }, [supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been successfully updated"
        badge="SUCCESS"
        showTrustIndicators={false}
      >
        <div className="brand-ghostship text-center stack-lg">
          <p className="color-success font-body">
            Redirecting you to sign in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below"
      badge="RESET PASSWORD"
      showTrustIndicators={false}
    >
      <AuthForm
        onSubmit={handleResetPassword}
        submitText="Update Password"
        loading={loading}
        error={error}
      >
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        
        <AuthInput
          id="confirm-password"
          name="confirm-password"
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </AuthForm>
      
      <div className="brand-ghostship text-center mt-lg">
        <AuthLink href="/auth/signin" className="cluster-xs justify-center">
          <ArrowLeft className="h-icon-xs w-icon-xs" />
          Back to sign in
        </AuthLink>
      </div>
    </AuthLayout>
  );
}
