import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';
import { typography } from '../(marketing)/lib/typography';
import { spacing, layouts } from '../(marketing)/lib/spacing';
import { accessibility } from '../(marketing)/lib/accessibility';

export const metadata: Metadata = {
  title: 'Sign In - Welcome Back | GHXSTSHIP',
  description: 'Sign in to your GHXSTSHIP account and continue managing your creative projects.',
  openGraph: {
    title: 'Sign In - Welcome Back | GHXSTSHIP',
    description: 'Sign in to your GHXSTSHIP account and continue managing your creative projects.',
    url: 'https://ghxstship.com/login',
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className={`${layouts.container} ${spacing.sectionPadding}`}>
        {/* Header */}
        <div className={`text-center ${spacing.marginBottom.xlarge}`}>
          <Link href="/" className={`inline-flex items-center space-x-2 ${spacing.marginBottom.large}`}>
            <span className={typography.heroTitle}>
              GHXSTSHIP
            </span>
          </Link>
          
          <h1 className={`${typography.heroTitle} ${spacing.marginBottom.medium}`}>
            WELCOME BACK
          </h1>
          <p className={`${typography.sectionSubtitle} max-w-2xl mx-auto`}>
            Sign in to your account and continue building amazing creative projects.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Sign In Form */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className={spacing.marginBottom.large}>
                <h2 className={`${typography.sectionTitle} ${spacing.marginBottom.small}`}>
                  SIGN IN
                </h2>
                <p className={typography.bodyLarge}>
                  Enter your credentials to access your account
                </p>
              </div>

              <form className={`${layouts.flexCol} ${spacing.textSpacing}`}>
                {/* Email */}
                <div>
                  <label className={`${typography.bodyMedium} block font-medium ${spacing.marginBottom.small}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      className={`w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${accessibility.focus.ring}`}
                      placeholder="Enter your email"
                      required
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
                      type="password"
                      className={`w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${accessibility.focus.ring}`}
                      placeholder="Enter your password"
                      required
                      aria-label="Password input"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-5 w-5" />
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
                    />
                    <label htmlFor="remember" className={typography.bodySmall}>
                      Remember me
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className={`${typography.bodySmall} text-primary hover:underline`}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
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
                <Button className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <Button className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need help signing in?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
