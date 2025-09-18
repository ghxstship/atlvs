'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthLink, AuthText } from '../_components/AuthForm';
import { Button } from '@ghxstship/ui';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Get email from URL params or session
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get from current session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setEmail(user.email);
        }
      });
    }

    // Handle email confirmation callback
    const handleEmailConfirmation = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session && !error) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/onboarding');
        }, 2000);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, supabase.auth, router]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('No email address found. Please try signing up again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="Your email has been successfully verified"
        badge="SUCCESS"
        showTrustIndicators={false}
      >
        <div className="text-center stack-lg">
          <CheckCircle className="h-16 w-16 color-success mx-auto" />
          <AuthText className="text-center">
            Redirecting you to complete your setup...
          </AuthText>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="We've sent a verification link to your email address"
      badge="VERIFY EMAIL"
      showTrustIndicators={false}
    >
      <div className="text-center stack-lg">
        <Mail className="h-16 w-16 color-primary mx-auto" />
        
        {email && (
          <div className="bg-secondary border border-secondary rounded-md p-md">
            <AuthText className="text-center font-medium">
              Verification email sent to:
            </AuthText>
            <p className="color-primary font-body text-center mt-xs">{email}</p>
          </div>
        )}
        
        <AuthText className="text-center">
          Click the link in your email to verify your account and continue to GHXSTSHIP.
        </AuthText>
        
        <AuthText className="text-center">
          If you don't see the email, check your spam folder or request a new one.
        </AuthText>

        {error && (
          <div className="bg-error border border-error rounded-md p-md">
            <p className="form-error font-body text-center">{error}</p>
          </div>
        )}
        
        <Button
          onClick={handleResendEmail}
          disabled={loading || !email}
          className="btn btn-secondary mx-auto"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-sm h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-sm h-4 w-4" />
              Resend Email
            </>
          )}
        </Button>
        
        <div className="cluster justify-center">
          <AuthLink href="/auth/signin">Back to sign in</AuthLink>
          <span className="color-muted">•</span>
          <AuthLink href="/contact">Contact support</AuthLink>
        </div>
      </div>
    </AuthLayout>
  );
}
