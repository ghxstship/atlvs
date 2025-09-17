'use client';

import React from "react";

import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ghxstship/ui"
import { Mail, CheckCircle } from 'lucide-react'

interface EmailVerificationStepProps {
  onNext: () => void
  onBack: () => void
  data: unknown
}

export default function EmailVerificationStep({ onNext, onBack, data }: EmailVerificationStepProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onNext()
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setError('')
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Mail className="w-6 h-6 color-primary" />
        </div>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification code to {(data as any)?.email || 'your email'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-body-sm form-label mb-2">
            Verification Code
          </label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e: React.FormEvent) => setVerificationCode((e.target as HTMLInputElement).value)}
            maxLength={6}
            aria-label="Verification code"
            aria-invalid={!!error}
            aria-describedby={error ? "code-error" : undefined}
          />
          {error && (
            <p id="code-error" className="text-body-sm color-destructive mt-1">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-body-sm">
          <span className="color-muted">
            Didn't receive the code?
          </span>
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
            className="p-0"
          >
            {isResending ? 'Resending...' : 'Resend code'}
          </Button>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-body-sm color-muted">
            Check your spam folder if you don't see the email in your inbox.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isVerifying}
        >
          Back
        </Button>
        <Button
          onClick={handleVerify}
          disabled={isVerifying || !verificationCode}
        >
          {isVerifying ? (
            <>Verifying...</>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
