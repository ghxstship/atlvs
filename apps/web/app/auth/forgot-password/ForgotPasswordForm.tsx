'use client';


import { useState } from 'react'
import { Card, Button, UnifiedInput, Label } from '@ghxstship/ui'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
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
        <div className="text-center">
          <CheckCircle className="h-12 w-12 color-success mx-auto mb-md" />
          <h2 className="font-display text-heading-4 text-heading-3 mb-sm">Check Your Email</h2>
          <p className="color-muted mb-lg">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <div className="stack-sm">
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
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <UnifiedInput             id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className="mt-xs"
          />
          <p className="text-body-sm color-muted mt-sm">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || !email} 
          className="w-full"
          size="lg"
        >
          {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          <ArrowRight className="ml-sm h-4 w-4" />
        </Button>
      </form>

      <div className="mt-lg text-center">
        <p className="text-body-sm color-muted">
          Remember your password?{' '}
          <Link 
            href="/auth/signin" 
            className="color-primary hover:color-primary/80 form-label"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  )
}
