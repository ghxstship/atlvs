'use client';



import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input
} from "@ghxstship/ui";
import { CheckCircle, Mail } from "lucide-react";

import React from "react";

import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ghxstship/ui'
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
        <div className="brand-ghostship flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-accent/10 mb-md">
          <Mail className="w-icon-md h-icon-md color-accent" />
        </div>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification code to {(data as any)?.email || 'your email'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="stack-md">
        <div>
          <label htmlFor="code" className="block text-body-sm form-label mb-sm">
            Verification Code
          </label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode((e.target as HTMLInputElement).value)}
            maxLength={6}
            aria-label="Verification code"
            aria-invalid={!!error}
            aria-describedby={error ? "code-error" : undefined}
          />
          {error && (
            <p id="code-error" className="text-body-sm color-destructive mt-xs">
              {error}
            </p>
          )}
        </div>

        <div className="brand-ghostship flex items-center justify-between text-body-sm">
          <span className="color-muted">
            Didn&apos;t receive the code?
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

        <div className="brand-ghostship bg-secondary/50 rounded-lg p-sm">
          <p className="text-body-sm color-muted">
            Check your spam folder if you don&apos;t see the email in your inbox.
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
              <CheckCircle className="w-icon-xs h-icon-xs mr-sm" />
              Verify Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
