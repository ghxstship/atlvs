'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ghxstship/ui';
import { X, Cookie, Settings } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Initialize analytics and other services
    initializeServices(allAccepted);
    
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    initializeServices(onlyNecessary);
    
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    initializeServices(preferences);
    
    setIsVisible(false);
    setShowPreferences(false);
  };

  const initializeServices = (prefs: CookiePreferences) => {
    // Initialize Google Analytics
    if (prefs.analytics) {
      // gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    
    // Initialize marketing pixels
    if (prefs.marketing) {
      // Initialize Facebook Pixel, etc.
    }
    
    // Initialize functional cookies
    if (prefs.functional) {
      // Initialize chat widgets, etc.
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
        <div className="container mx-auto px-4 py-6">
          {!showPreferences ? (
            // Main consent banner
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies and similar technologies to provide, protect, and improve our services. 
                    By clicking "Accept All", you consent to our use of cookies for analytics, marketing, and functionality.{' '}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-sm underline"
                      onClick={() => setShowPreferences(true)}
                    >
                      Customize preferences
                    </Button>{' '}
                    or read our{' '}
                    <a href="/legal/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto"
                >
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Preferences panel
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-title text-xl font-bold">Cookie Preferences</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Necessary Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Essential for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors",
                        preferences.analytics ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                        preferences.analytics ? "translate-x-6" : "translate-x-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Used to track visitors across websites to display relevant advertisements.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors",
                        preferences.marketing ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                        preferences.marketing ? "translate-x-6" : "translate-x-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Functional Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Enable enhanced functionality like chat widgets and personalized content.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, functional: !prev.functional }))}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors",
                        preferences.functional ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                        preferences.functional ? "translate-x-6" : "translate-x-0.5"
                      )}></div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
