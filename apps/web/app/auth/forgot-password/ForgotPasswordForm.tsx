'use client';



import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@ghxstship/ui";
import { CheckCircle, Mail } from "lucide-react";

import { useState } from 'react'
import { Card, Button, Input, Label } from '@ghxstship/ui'
import { ArrowRight, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Reset password logic here
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1000)
  }

  if (sent) {
    return (
      <Card className="p-lg">
        <div className="brand-ghostship text-center">
          <CheckCircle className="h-icon-2xl w-icon-2xl color-success mx-auto mb-md" />
          <h2 className="font-display text-heading-4 text-heading-3 mb-sm">Check Your Email</h2>
          <p className="color-muted mb-lg">
            We&apos;ve sent password reset instructions to <strong>{email}</strong>
          </p>
          <div className="brand-ghostship stack-sm">
            <Button 
              onClick={() => setSent(false)} 
              variant="outline" 
              className="w-full"
            >
              Send Another Email
            </Button>
            <Link href="/auth/signin">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-lg">
      <form onSubmit={handleSubmit} className="stack-lg">
        <div>
          <Label htmlFor="email" className="flex items-center gap-sm">
            <Mail className="h-icon-xs w-icon-xs" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="mt-xs"
          />
          <p className="text-body-sm color-muted mt-sm">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || !email} 
          className="w-full"
          size="lg"
        >
          {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
        </Button>
      </form>

      <div className="brand-ghostship mt-lg text-center">
        <p className="text-body-sm color-muted">
          Remember your password?{' '}
          <Link 
            href="/auth/signin" 
            className="color-accent hover:color-accent/80 form-label"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  )
}
