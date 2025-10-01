'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@ghxstship/ui';
import { X, Gift, ArrowRight } from 'lucide-react';

export function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has already been shown in this session
    const popupShown = sessionStorage.getItem('exit_intent_shown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (e.clientY <= 0 && !exitIntentTriggered && !hasShown) {
        exitIntentTriggered = true;
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');

        // Track exit intent trigger
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exit_intent_triggered', {
            event_category: 'engagement',
            event_label: 'exit_popup',
          });
        }
      }
    };

    // Add delay before activating exit intent (5 seconds)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClaim = () => {
    // Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_conversion', {
        event_category: 'conversion',
        event_label: 'claim_discount',
        value: 20,
      });
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'exit_intent_discount',
        value: 20,
        currency: 'USD',
      });
    }

    // Redirect to signup with promo code
    window.location.href = '/auth/signup?promo=WELCOME20&source=exit_intent';
  };

  const handleClose = () => {
    setShowPopup(false);
    
    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_dismissed', {
        event_category: 'engagement',
        event_label: 'exit_popup',
      });
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="relative w-full max-w-md mx-md shadow-2xl animate-slide-up">
        <button
          onClick={handleClose}
          className="absolute right-4 top-md rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-icon-xs w-icon-xs" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-xl">
          <div className="flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-gradient-to-r from-primary to-accent mb-md mx-auto">
            <Gift className="h-icon-md w-icon-md text-background" />
          </div>
          
          <h2 className="text-center text-heading-3 mb-sm">
            Wait! Before you go...
          </h2>
          
          <p className="text-center text-body color-muted mb-lg">
            Get <span className="text-heading-4 color-foreground">20% off</span> your first month with code{' '}
            <span className="font-mono text-heading-4 color-primary">WELCOME20</span>
          </p>

          <div className="space-y-md">
            <div className="bg-secondary/20 rounded-lg p-md">
              <ul className="space-y-sm text-body-sm">
                <li className="flex items-center gap-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>14-day free trial included</span>
                </li>
                <li className="flex items-center gap-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>No credit card required</span>
                </li>
                <li className="flex items-center gap-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleClaim} 
              className="w-full group"
              size="lg"
            >
              Claim Your 20% Discount
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
            </Button>

            <button
              onClick={handleClose}
              className="w-full text-body-sm color-muted hover:color-foreground transition-colors"
            >
              No thanks, I'll pay full price
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
