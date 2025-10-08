/**
 * usePrevious Hook
 * Track previous value
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
