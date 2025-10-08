/**
 * useIntersectionObserver Hook
 * Track element visibility
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
  options?: UseIntersectionObserverOptions
): IntersectionObserverEntry | null {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options || {};
  
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  
  const frozen = entry?.isIntersecting && freezeOnceVisible;
  
  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;
    
    if (!hasIOSupport || frozen || !node) return;
    
    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entry]) => setEntry(entry), observerParams);
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);
  
  return entry;
}
