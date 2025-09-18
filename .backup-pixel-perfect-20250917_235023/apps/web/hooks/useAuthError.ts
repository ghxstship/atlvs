import { useState, useCallback } from 'react'

interface AuthError {
  message: string
  code?: string
}

export function useAuthError() {
  const [error, setError] = useState<AuthError | null>(null)

  const handleError = useCallback((err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err) {
      setError(err as AuthError)
    } else {
      setError({ message: 'An unknown error occurred' })
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError
  }
}
