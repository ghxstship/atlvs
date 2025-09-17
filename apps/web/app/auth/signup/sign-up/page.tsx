'use client';

import React from "react";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, Badge } from "@ghxstship/ui"
import { Eye, EyeOff, ArrowRight, Shield, Users } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      router.push('/auth/verify-email' as Route)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="pt-8 pb-6">
        <div className="container">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="font-display text-heading-3 text-heading-3 tracking-tight">GHXSTSHIP</h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Badge className="mb-4">CREATE ACCOUNT</Badge>
            <h2 className="font-display text-heading-3 text-heading-3 tracking-tight mb-2">
              Join GHXSTSHIP
            </h2>
            <p className="color-muted font-body">
              Create your account to start managing productions
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-body-sm form-label font-body mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-body-sm form-label font-body mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 color-muted" />
                    ) : (
                      <Eye className="h-4 w-4 color-muted" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-body-sm form-label font-body mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 color-muted" />
                    ) : (
                      <Eye className="h-4 w-4 color-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-body-sm color-destructive font-body">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-body-sm color-muted font-body">
                Already have an account?{' '}
                <Link href="/auth/signin" className="color-primary hover:underline form-label">
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-center space-x-6 text-body-sm color-muted">
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                <span>Secure</span>
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>Trusted by 10K+ users</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="pb-8">
        <div className="container">
          <div className="text-center">
            <p className="text-body-sm color-muted font-body">
              By creating an account, you agree to our{' '}
              <Link href={"/legal/terms" as Route} className="color-primary hover:underline">Terms of Service</Link> and{' '}
              <Link href={"/legal/privacy" as Route} className="color-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
