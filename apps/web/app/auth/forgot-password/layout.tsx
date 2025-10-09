import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | ATLVS',
  description: 'Reset your ATLVS account password and regain access to your creative projects.',
  openGraph: {
    title: 'Reset Password | ATLVS',
    description: 'Reset your ATLVS account password and regain access to your creative projects.',
    url: 'https://ghxstship.com/auth/forgot-password'
  }
};

export default function ForgotPasswordLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
