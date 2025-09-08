'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 2026 Sidebar Context Provider
// AI-powered personalization and adaptive behavior

interface SidebarPreferences {
  isCollapsed: boolean;
  pinnedItems: string[];
  frequentItems: string[];
  recentItems: string[];
  searchHistory: string[];
  customOrder: string[];
  adaptiveMode: boolean;
}

interface SidebarContextType {
  preferences: SidebarPreferences;
  updatePreferences: (updates: Partial<SidebarPreferences>) => void;
  trackNavigation: (itemId: string, href: string) => void;
  getAdaptiveOrder: () => string[];
  togglePin: (itemId: string) => void;
  isItemPinned: (itemId: string) => boolean;
  getItemFrequency: (itemId: string) => number;
}

const defaultPreferences: SidebarPreferences = {
  isCollapsed: false,
  pinnedItems: ['dashboard', 'pipeline'],
  frequentItems: [],
  recentItems: [],
  searchHistory: [],
  customOrder: [],
  adaptiveMode: true,
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [preferences, setPreferences] = useState<SidebarPreferences>(defaultPreferences);
  const [navigationHistory, setNavigationHistory] = useState<Array<{
    itemId: string;
    href: string;
    timestamp: number;
    count: number;
  }>>([]);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      const stored = localStorage.getItem(`sidebar-preferences-${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences({ ...defaultPreferences, ...parsed });
        } catch (error) {
          console.warn('Failed to parse sidebar preferences:', error);
        }
      }
    }
  }, [userId]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(
        `sidebar-preferences-${userId}`,
        JSON.stringify(preferences)
      );
    }
  }, [preferences, userId]);

  const updatePreferences = (updates: Partial<SidebarPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const trackNavigation = (itemId: string, href: string) => {
    const now = Date.now();
    
    setNavigationHistory(prev => {
      const existing = prev.find(item => item.itemId === itemId);
      if (existing) {
        return prev.map(item =>
          item.itemId === itemId
            ? { ...item, timestamp: now, count: item.count + 1 }
            : item
        );
      } else {
        return [...prev, { itemId, href, timestamp: now, count: 1 }];
      }
    });

    // Update recent items
    setPreferences(prev => ({
      ...prev,
      recentItems: [
        itemId,
        ...prev.recentItems.filter(id => id !== itemId)
      ].slice(0, 10),
    }));

    // Update frequent items based on usage
    const itemHistory = navigationHistory.find(item => item.itemId === itemId);
    const frequency = itemHistory ? itemHistory.count + 1 : 1;
    
    if (frequency >= 5) {
      setPreferences(prev => ({
        ...prev,
        frequentItems: Array.from(new Set([itemId, ...prev.frequentItems])).slice(0, 8),
      }));
    }
  };

  const getAdaptiveOrder = (): string[] => {
    if (!preferences.adaptiveMode) {
      return preferences.customOrder;
    }

    // AI-powered adaptive ordering
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    // Score items based on multiple factors
    const itemScores = navigationHistory.map(item => {
      const recency = Math.max(0, 1 - (now - item.timestamp) / weekMs);
      const frequency = Math.min(1, item.count / 20);
      const isPinned = preferences.pinnedItems.includes(item.itemId) ? 0.5 : 0;
      
      // Time-based patterns (e.g., finance items used more on Fridays)
      const dayOfWeek = new Date().getDay();
      let timeBoost = 0;
      
      if (item.itemId === 'finance' && dayOfWeek === 5) timeBoost = 0.2;
      if (item.itemId === 'analytics' && dayOfWeek === 1) timeBoost = 0.2;
      
      const totalScore = (recency * 0.3) + (frequency * 0.4) + isPinned + timeBoost;
      
      return { itemId: item.itemId, score: totalScore };
    });

    // Sort by score and return item IDs
    return itemScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.itemId);
  };

  const togglePin = (itemId: string) => {
    setPreferences(prev => ({
      ...prev,
      pinnedItems: prev.pinnedItems.includes(itemId)
        ? prev.pinnedItems.filter(id => id !== itemId)
        : [...prev.pinnedItems, itemId],
    }));
  };

  const isItemPinned = (itemId: string): boolean => {
    return preferences.pinnedItems.includes(itemId);
  };

  const getItemFrequency = (itemId: string): number => {
    const item = navigationHistory.find(h => h.itemId === itemId);
    return item ? item.count : 0;
  };

  return (
    <SidebarContext.Provider value={{
      preferences,
      updatePreferences,
      trackNavigation,
      getAdaptiveOrder,
      togglePin,
      isItemPinned,
      getItemFrequency,
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
