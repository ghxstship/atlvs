import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | GHXSTSHIP',
  description: 'Reset your GHXSTSHIP account password and regain access to your creative projects.',
  openGraph: {
    title: 'Reset Password | GHXSTSHIP',
    description: 'Reset your GHXSTSHIP account password and regain access to your creative projects.',
    url: 'https://ghxstship.com/auth/forgot-password',
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
