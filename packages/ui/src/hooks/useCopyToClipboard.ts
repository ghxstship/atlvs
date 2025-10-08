/**
 * useCopyToClipboard Hook
 * Copy text to clipboard
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import { useState } from 'react';

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [boolean, CopyFn] {
  const [copied, setCopied] = useState(false);
  
  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopied(false);
      return false;
    }
  };
  
  return [copied, copy];
}
