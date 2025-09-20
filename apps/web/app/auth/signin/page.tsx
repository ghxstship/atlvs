'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '../_components/AuthLayout';
import { AuthForm, AuthInput, AuthLink, AuthText } from '../_components/AuthForm';

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
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as any).message) : 'Sign in error';
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your production management dashboard"
      badge="WELCOME BACK"
    >
      <AuthForm
        onSubmit={handleSignIn}
        submitText="Sign In"
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        
        <div className="brand-ghostship text-center">
          <AuthLink href="/auth/forgot-password">
            Forgot your password?
          </AuthLink>
        </div>
      </AuthForm>
      
      <div className="brand-ghostship text-center mt-lg">
        <AuthText>
          Don't have an account?{' '}
          <AuthLink href="/auth/signup">Sign up for free</AuthLink>
        </AuthText>
      </div>
    </AuthLayout>
  )
}
