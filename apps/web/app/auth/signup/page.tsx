import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { typography } from '../../(marketing)/lib/typography';
import { spacing, layouts } from '../../(marketing)/lib/spacing';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up - Start Your Free Trial | GHXSTSHIP',
  description: 'Create your GHXSTSHIP account and start managing your creative projects with our powerful production management platform.',
  openGraph: {
    title: 'Sign Up - Start Your Free Trial | GHXSTSHIP',
    description: 'Create your GHXSTSHIP account and start managing your creative projects with our powerful production management platform.',
    url: 'https://ghxstship.com/auth/signup',
  },
};


export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className={`${layouts.container} ${spacing.sectionPadding}`}>
        {/* Header */}
        <div className={`text-center ${spacing.marginBottom.xlarge}`}>
          <Link href="/home" className={`inline-flex items-center space-x-2 ${spacing.marginBottom.large}`}>
            <span className={typography.heroTitle}>
              GHXSTSHIP
            </span>
          </Link>
          
          <Badge variant="outline" className={spacing.marginBottom.small}>
            14-Day Free Trial
          </Badge>
          <h1 className={`${typography.heroTitle} ${spacing.marginBottom.medium}`}>
            GET STARTED
          </h1>
          <p className={`${typography.sectionSubtitle} max-w-2xl mx-auto`}>
            Create your account and start building amazing creative projects.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Sign Up Form */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <SignUpForm />
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need help getting started?{' '}
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
