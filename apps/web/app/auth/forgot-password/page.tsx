'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthForm, AuthInput, AuthLink, AuthText } from '../_components/AuthForm';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address"
        badge="EMAIL SENT"
        showTrustIndicators={false}
      >
        <div className="text-center stack-lg">
          <AuthText className="text-center">
            If you don't see the email in your inbox, check your spam folder.
          </AuthText>
          
          <div className="cluster justify-center">
            <AuthLink href="/auth/signin" className="cluster-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </AuthLink>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      badge="FORGOT PASSWORD"
      showTrustIndicators={false}
    >
      <AuthForm
        onSubmit={handleResetPassword}
        submitText="Send Reset Link"
        loading={loading}
        error={error}
      >
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </AuthForm>
      
      <div className="text-center stack-md mt-lg">
        <AuthLink href="/auth/signin" className="cluster-xs justify-center">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </AuthLink>
        
        <AuthText>
          Still having trouble?{' '}
          <AuthLink href="/contact">Contact support</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  );
}
