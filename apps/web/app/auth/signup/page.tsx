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
    url: 'https://ghxstship.com/auth/signup',
  },
};


export default function SignUpPage() {
  return (
    <AuthLayout
      title="Welcome Aboard"
      subtitle="Create your account and start building amazing creative projects"
      badge="JOIN GHXSTSHIP"
      showFooter={true}
    >
      <SignUpForm />
      
      <div className="text-center mt-lg">
        <AuthText>
          Need help getting started?{' '}
          <AuthLink href="/contact">Contact support</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  );
}
