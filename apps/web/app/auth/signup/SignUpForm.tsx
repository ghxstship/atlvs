"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@ghxstship/auth';
import { AuthForm, AuthInput, AuthLink, AuthText } from '../_components/AuthForm';

export function SignUpForm() {
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/onboarding?step=plan-selection`;
  const next = searchParams?.get('next') || '/dashboard/overview';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true); setError(null); setMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      
      // Redirect to onboarding flow after successful signup
      window.location.href = '/auth/onboarding?step=verify-email';
    } catch (e) {
      setError(e?.message || 'Signup error');
    } finally {
      setPending(false);
    }
  };

  const onGoogle = async () => {
    setPending(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) throw error;
    } catch (e) {
      setError(e?.message || 'Google OAuth error');
      setPending(false);
    }
  };


  return (
    <>
      <AuthForm
        onSubmit={onSubmit}
        submitText="Create Account"
        loading={pending}
        error={error}
      >
        <AuthInput
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
        
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        
        <div className="cluster">
          <input
            type="checkbox"
            id="terms"
            required
            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
          />
          <label htmlFor="terms" className="form-helper leading-relaxed">
            I agree to the{' '}
            <AuthLink href="/legal/terms">Terms of Service</AuthLink>
            {' '}and{' '}
            <AuthLink href="/legal/privacy">Privacy Policy</AuthLink>
          </label>
        </div>
        
        {message && (
          <div className="bg-success border border-success rounded-md p-md">
            <p className="text-body-sm color-success font-body">{message}</p>
          </div>
        )}
      </AuthForm>
      
      <div className="text-center mt-lg">
        <AuthText>
          Already have an account?{' '}
          <AuthLink href="/auth/signin">Sign in</AuthLink>
        </AuthText>
      </div>
    </>
  );
}
