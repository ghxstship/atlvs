import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <span className={`text-2xl font-bold tracking-tight text-foreground ${anton.className}`}>
              GHXSTSHIP
            </span>
          </Link>
          
          <h1 className={`${anton.className} uppercase text-4xl lg:text-5xl font-bold mb-6`}>
            RESET PASSWORD
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Reset Form */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className={`${anton.className} uppercase text-2xl font-bold mb-2`}>
                  FORGOT PASSWORD
                </h2>
                <p className="text-muted-foreground">
                  We'll email you instructions to reset your password
                </p>
              </div>

              <form className="space-y-6">
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
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button size="lg" className="w-full">
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Still having trouble?{' '}
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
