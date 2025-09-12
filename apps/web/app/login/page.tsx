import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@ghxstship/ui';
import { typography } from '../(marketing)/lib/typography';
import { spacing, layouts } from '../(marketing)/lib/spacing';
import { SignInForm } from './SignInForm';

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
            <span className={typography.sectionTitle}>
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
              <SignInForm />

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
