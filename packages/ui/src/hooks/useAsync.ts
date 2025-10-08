/**
 * useAsync Hook
 * Handle async operations with loading, error states
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const data = await asyncFunction();
      setState({ loading: false, error: null, data });
    } catch (error) {
      setState({ loading: false, error: error as Error, data: null });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute };
}
