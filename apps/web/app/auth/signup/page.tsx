import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { Anton } from 'next/font/google';
import { SignUpForm } from './SignUpForm';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/home" className="inline-flex items-center space-x-2 mb-8">
            <span className={`text-2xl font-bold tracking-tight text-foreground ${anton.className}`}>
              GHXSTSHIP
            </span>
          </Link>
          
          <Badge variant="outline" className="mb-4">
            14-Day Free Trial
          </Badge>
          <h1 className={`${anton.className} uppercase text-4xl lg:text-5xl font-bold mb-6`}>
            GET STARTED
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
