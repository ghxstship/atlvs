'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ghxstship/ui';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Github, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { typography } from '../(marketing)/lib/typography';
import { spacing, layouts } from '../(marketing)/lib/spacing';
import { accessibility } from '../(marketing)/lib/accessibility';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Redirect to ATLVS dashboard
        router.push('/dashboard/overview');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/overview`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/overview`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className={spacing.marginBottom.large}>
        <h2 className={`${typography.sectionTitle} ${spacing.marginBottom.small}`}>
          SIGN IN
        </h2>
        <p className={typography.bodyLarge}>
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className={`${layouts.flexCol} ${spacing.textSpacing}`}>
        {/* Email */}
        <div>
          <label className={`${typography.bodyMedium} block font-medium ${spacing.marginBottom.small}`}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${accessibility.focus.ring}`}
              placeholder="Enter your email"
              required
              disabled={isLoading}
              aria-label="Email address input"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={`${typography.bodyMedium} block font-medium ${spacing.marginBottom.small}`}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${accessibility.focus.ring}`}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              aria-label="Password input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
              disabled={isLoading}
            />
            <label htmlFor="remember" className={typography.bodySmall}>
              Remember me
            </label>
          </div>
          <a href="/auth/forgot-password" className={`${typography.bodySmall} text-primary hover:underline`}>
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-sm text-muted-foreground">Or continue with</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <Button 
          type="button" 
          onClick={handleGoogleSignIn} 
          className="w-full" 
          variant="outline"
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
        <Button 
          type="button" 
          onClick={handleGitHubSignIn} 
          className="w-full" 
          variant="outline"
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
