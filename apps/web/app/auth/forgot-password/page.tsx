import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { typography } from '../../_components/lib/typography';
import { spacing, layouts } from '../../_components/lib/spacing';
import { accessibility } from '../../_components/lib/accessibility';

export const metadata: Metadata = {
  title: 'Reset Password | GHXSTSHIP',
  description: 'Reset your GHXSTSHIP account password and regain access to your creative projects.',
  openGraph: {
    title: 'Reset Password | GHXSTSHIP',
    description: 'Reset your GHXSTSHIP account password and regain access to your creative projects.',
    url: 'https://ghxstship.com/auth/forgot-password',
  },
};

export default function ForgotPasswordPage() {
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
            RESET PASSWORD
          </h1>
          <p className={`${typography.sectionSubtitle} max-w-2xl mx-auto`}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Reset Form */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className={spacing.marginBottom.large}>
                <h2 className={`${typography.sectionTitle} ${spacing.marginBottom.small}`}>
                  FORGOT PASSWORD
                </h2>
                <p className={typography.bodyLarge}>
                  We'll email you instructions to reset your password
                </p>
              </div>

              <form className={`${layouts.flexCol} ${spacing.textSpacing}`}>
                {/* Email */}
                <div>
                  <label className={`${typography.bodyMedium} block form-label ${spacing.marginBottom.small}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 color-muted" />
                    <input
                      type="email"
                      className={`w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${accessibility.focus.ring}`}
                      placeholder="Enter your email address"
                      required
                      aria-label="Email address input"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button className="w-full">
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/auth/signin" className={`inline-flex items-center ${typography.bodySmall} color-primary hover:underline`}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center mt-8">
            <p className="text-body-sm color-muted">
              Still having trouble?{' '}
              <Link href="/contact" className="color-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
