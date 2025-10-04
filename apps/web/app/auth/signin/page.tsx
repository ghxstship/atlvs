'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthForm, AuthInput, AuthLink, AuthText } from '../_components/AuthForm';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = searchParams?.get('next') || '/dashboard';

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace(redirectPath);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your production management dashboard."
      badge="Welcome back"
      showFooter
    >
      <AuthForm onSubmit={handleSignIn} submitText="Sign in" loading={loading} error={error}>
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@studio.com"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />

        <div className="text-right">
          <AuthLink href="/auth/forgot-password">Forgot password?</AuthLink>
        </div>
      </AuthForm>

      <div className="mt-lg text-center">
        <AuthText>
          New to GHXSTSHIP?{' '}
          <AuthLink href="/auth/signup">Create an account</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  );
}
