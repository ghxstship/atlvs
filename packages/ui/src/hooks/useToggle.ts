/**
 * useToggle Hook
 * Toggle boolean state
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import { useState, useCallback } from 'react';

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  return [value, toggle, setValue];
}
