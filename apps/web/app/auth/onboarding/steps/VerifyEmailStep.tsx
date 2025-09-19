"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@supabase/ssr';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface VerifyEmailStepProps {
  user;
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

  useEffect(() => {
    if (user?.email_confirmed_at) {
      setIsVerified(true);
    }
  }, [user]);

  const resendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      setResendMessage('Verification email sent! Check your inbox.');
    } catch (error) {
      setResendMessage(error.message || 'Failed to resend email');
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

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, onNext]);

  return (
    <Card className="shadow-modal">
      <CardContent className="p-xl text-center">
        <div className="mb-xl">
          {isVerified ? (
            <CheckCircle className="h-16 w-16 color-success mx-auto mb-md" />
          ) : (
            <Mail className="h-16 w-16 color-primary mx-auto mb-md" />
          )}
          
          <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-md`}>
            {isVerified ? 'EMAIL VERIFIED!' : 'VERIFY YOUR EMAIL'}
          </h1>
          
          {isVerified ? (
            <p className="text-body color-muted">
              Great! Your email has been verified. Redirecting you to the next step...
            </p>
          ) : (
            <div className="stack-md">
              <p className="text-body color-muted">
                We've sent a verification link to:
              </p>
              <p className="text-heading-4 text-heading-4 color-foreground">
                {user?.email}
              </p>
              <p className="color-muted">
                Click the link in your email to verify your account and continue.
              </p>
            </div>
          )}
        </div>

        {!isVerified && (
          <div className="stack-md">
            <Button 
              onClick={checkVerification}
              className="w-full"
             
            >
              <RefreshCw className="mr-sm h-4 w-4" />
              I've Verified My Email
            </Button>
            
            <div className="text-center">
              <p className="text-body-sm color-muted mb-sm">
                Didn't receive the email?
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
          <div className="mt-lg">
            <Button className="w-full">
              Continue to Plan Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
