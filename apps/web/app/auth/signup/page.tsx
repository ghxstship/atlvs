import type { Metadata } from 'next';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthText, AuthLink } from '../_components/AuthForm';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up - Start Your Free Trial | GHXSTSHIP',
  description: 'Create your GHXSTSHIP account and start managing your creative projects with our powerful production management platform.',
  openGraph: {
    title: 'Sign Up - Start Your Free Trial | GHXSTSHIP',
    description: 'Create your GHXSTSHIP account and start managing your creative projects with our powerful production management platform.',
    url: 'https://ghxstship.com/auth/signup'
  }
};


export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free trial and orchestrate every production milestone with GHXSTSHIP."
      badge="Start your free trial"
      showFooter
    >
      <SignUpForm />

      <div className="mt-lg text-center">
        <AuthText>
          Need help getting started?{' '}
          <AuthLink href="/contact">Talk with support</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  );
}
