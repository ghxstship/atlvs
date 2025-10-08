'use client';

import { useEffect } from 'react';
import { getOfflineSupportService } from '@ghxstship/infrastructure';

export function OfflineSupportInitializer() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initialize offline support service on client-side
    const initializeOfflineSupport = async () => {
      try {
        const offlineService = getOfflineSupportService();
        await offlineService.initialize();
      } catch (error) {
        console.error('Failed to initialize offline support:', error);
      }
    };

    initializeOfflineSupport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component doesn't render anything
}
