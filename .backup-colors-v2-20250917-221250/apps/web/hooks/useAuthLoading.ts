"use client";

import { useState } from 'react';

export function useAuthLoading() {
  const [loading, setLoading] = useState(false);
  
  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, withLoading, setLoading };
}
