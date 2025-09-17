'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, Input, Label, Badge } from "@ghxstship/ui"
import { ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-background/20 color-primary-foreground border-primary-foreground/30">WELCOME BACK</Badge>
          <h1 className="font-display text-heading-2 text-heading-3 color-primary-foreground mb-2">
            Sign in to GHXSTSHIP
          </h1>
          <p className="color-muted">
            Access your production management dashboard
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="text-body-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="color-primary hover:color-primary/80 form-label"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="color-destructive text-body-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-sm color-muted">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="color-primary hover:color-primary/80 form-label"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-body-sm color-muted mb-2">
                Trusted by production teams worldwide
              </p>
              <div className="flex justify-center items-center space-x-4 text-body-sm color-muted">
                <span>50K+ Users</span>
                <span>•</span>
                <span>98% Uptime</span>
                <span>•</span>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
