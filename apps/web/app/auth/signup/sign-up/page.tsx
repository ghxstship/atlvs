'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../../_components/AuthLayout';
import { AuthForm, AuthInput, AuthLink, AuthText } from '../../_components/AuthForm';

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
    <AuthLayout
      title="Join GHXSTSHIP"
      subtitle="Create your account to start managing productions"
      badge="CREATE ACCOUNT"
      showFooter={true}
    >
      <AuthForm
        onSubmit={handleSignUp}
        submitText="Create Account"
        loading={loading}
        error={error}
      >
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        
        <AuthInput
          id="confirm-password"
          name="confirm-password"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </AuthForm>
      
      <div className="text-center mt-lg">
        <AuthText>
          Already have an account?{' '}
          <AuthLink href="/auth/signin">Sign in</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  )
}
