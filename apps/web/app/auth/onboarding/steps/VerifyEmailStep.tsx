"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@ghxstship/auth';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface VerifyEmailStepProps {
  user: any;
  onNext: () => void;
  updateData: (data: any) => void;
}

export function VerifyEmailStep({ user, onNext, updateData }: VerifyEmailStepProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const supabase = createBrowserClient();

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
    } catch (error: any) {
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
    <Card className="shadow-xl">
      <CardContent className="p-8 text-center">
        <div className="mb-8">
          {isVerified ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
          )}
          
          <h1 className={`${anton.className} uppercase text-3xl font-bold mb-4`}>
            {isVerified ? 'EMAIL VERIFIED!' : 'VERIFY YOUR EMAIL'}
          </h1>
          
          {isVerified ? (
            <p className="text-lg text-muted-foreground">
              Great! Your email has been verified. Redirecting you to the next step...
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                We've sent a verification link to:
              </p>
              <p className="text-xl font-semibold text-foreground">
                {user?.email}
              </p>
              <p className="text-muted-foreground">
                Click the link in your email to verify your account and continue.
              </p>
            </div>
          )}
        </div>

        {!isVerified && (
          <div className="space-y-4">
            <Button 
              onClick={checkVerification}
              className="w-full"
              width="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              I've Verified My Email
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the email?
              </p>
              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={isResending}
                size="sm"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              {resendMessage && (
                <p className="text-sm mt-2 text-muted-foreground">
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {isVerified && (
          <div className="mt-6">
            <Button size="lg" className="w-full">
              Continue to Plan Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
