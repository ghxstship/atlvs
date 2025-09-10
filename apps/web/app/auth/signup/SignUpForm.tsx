"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@ghxstship/auth';
import { Button } from '@ghxstship/ui';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export function SignUpForm() {
  const router = useRouter();
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
    } catch (e: any) {
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
    } catch (e: any) {
      setError(e?.message || 'Google OAuth error');
      setPending(false);
    }
  };

  const onGitHub = async () => {
    setPending(true); setError(null);
    try {
      // Use server route to initiate GitHub OAuth for proper cookie handling
      window.location.href = '/api/v1/auth/github?redirect_to=' + encodeURIComponent(redirectTo);
    } catch (e: any) {
      setError(e?.message || 'GitHub OAuth error');
      setPending(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`${anton.className} uppercase text-2xl font-bold mb-2`}>
          SIGN UP
        </h2>
        <p className="text-muted-foreground">
          Create your account to get started
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create Account'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-sm text-muted-foreground">Or continue with</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      {/* Social Signup */}
      <div className="space-y-3">
        <Button size="lg" className="w-full" disabled={pending} onClick={onGoogle}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
        <Button size="lg" className="w-full" disabled={pending} onClick={onGitHub}>
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      {/* Messages */}
      {message && <div className="mt-6 text-sm text-green-600">{message}</div>}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
