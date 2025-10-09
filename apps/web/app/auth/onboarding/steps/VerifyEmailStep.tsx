"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { createBrowserClient } from '@supabase/ssr';


interface VerifyEmailStepProps {
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
  };
  onNext: () => void;
  updateData: (data: any) => void;
}

export function VerifyEmailStep({ user, onNext, updateData }: VerifyEmailStepProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setIsVerified(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) throw error;
      setResendMessage('Verification email sent! Check your inbox.');
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const checkVerification = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email_confirmed_at) {
      setIsVerified(true);
      updateData({ emailVerified: true });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified, onNext]);

  return (
    <Card className="shadow-modal">
      <CardContent className="p-xl text-center">
        <div className="brand-ghostship mb-xl">
          {isVerified ? (
            <CheckCircle className="h-component-md w-component-md color-success mx-auto mb-md" />
          ) : (
            <Mail className="h-component-md w-component-md color-accent mx-auto mb-md" />
          )}
          
          <h1 className={`${anton.className} uppercase text-heading-2 mb-md`}>
            {isVerified ? 'EMAIL VERIFIED!' : 'VERIFY YOUR EMAIL'}
          </h1>
          
          {isVerified ? (
            <p className="text-body color-muted">
              Great! Your email has been verified. Redirecting you to the next step...
            </p>
          ) : (
            <div className="brand-ghostship stack-md">
              <p className="text-body color-muted">
                We&apos;ve sent a verification link to:
              </p>
              <p className="text-heading-4 color-foreground font-body">
                {user?.email}
              </p>
              <p className="color-muted">
                Click the link in your email to verify your account and continue.
              </p>
            </div>
          )}
        </div>

        {!isVerified && (
          <div className="brand-ghostship stack-md">
            <Button 
              onClick={checkVerification}
              className="w-full"
             
            >
              <RefreshCw className="mr-sm h-icon-xs w-icon-xs" />
              I&apos;ve Verified My Email
            </Button>
            
            <div className="brand-ghostship text-center">
              <p className="text-body-sm color-muted mb-sm">
                Didn&apos;t receive the email?
              </p>
              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={isResending}
               
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              {resendMessage && (
                <p className="text-body-sm mt-sm color-muted">
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {isVerified && (
          <div className="brand-ghostship mt-lg">
            <Button className="w-full">
              Continue to Plan Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
