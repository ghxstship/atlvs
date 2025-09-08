'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Facebook Pixel Configuration
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1234567890';

// LinkedIn Insight Tag Configuration
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '12345';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    lintrk: (...args: any[]) => void;
    _linkedin_partner_id: string;
    _linkedin_data_partner_ids: string[];
  }
}

// Google Analytics 4 Functions
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackConversion = (conversionId: string, value?: number, currency = 'USD') => {
  gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
    currency: currency,
  });
};

export const trackPurchase = (transactionId: string, value: number, currency = 'USD', items: any[] = []) => {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
};

// Facebook Pixel Functions
export const fbPixel = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

export const trackFBEvent = (eventName: string, parameters?: any) => {
  fbPixel('track', eventName, parameters);
};

export const trackFBCustomEvent = (eventName: string, parameters?: any) => {
  fbPixel('trackCustom', eventName, parameters);
};

// LinkedIn Insight Tag Functions
export const trackLinkedInEvent = (eventType: string, eventId?: string) => {
  if (typeof window !== 'undefined' && window.lintrk) {
    window.lintrk('track', { conversion_id: eventId || eventType });
  }
};

// Custom Event Tracking
export const trackCustomEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Google Analytics
  gtag('event', eventName, {
    custom_parameter: true,
    ...properties,
  });

  // Facebook Pixel
  fbPixel('trackCustom', eventName, properties);

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
};

// Page View Tracking
export const trackPageView = (url: string, title?: string) => {
  // Google Analytics
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: title,
    page_location: url,
  });

  // Facebook Pixel
  fbPixel('track', 'PageView');

  // Custom tracking
  trackCustomEvent('page_view', {
    page_url: url,
    page_title: title,
  });
};

// Business Event Tracking
export const trackBusinessEvents = {
  // Lead Generation
  leadGenerated: (source: string, campaign?: string) => {
    trackEvent('generate_lead', 'engagement', source);
    trackFBEvent('Lead', { source, campaign });
    trackCustomEvent('lead_generated', { source, campaign });
  },

  // Trial Started
  trialStarted: (plan: string, source?: string) => {
    trackEvent('sign_up', 'engagement', plan);
    trackFBEvent('StartTrial', { content_name: plan, source });
    trackCustomEvent('trial_started', { plan, source });
  },

  // Demo Requested
  demoRequested: (source: string, company?: string) => {
    trackEvent('request_demo', 'engagement', source);
    trackFBEvent('Schedule', { content_name: 'demo', source, company });
    trackCustomEvent('demo_requested', { source, company });
  },

  // Contact Form
  contactSubmitted: (formType: string, source?: string) => {
    trackEvent('contact', 'engagement', formType);
    trackFBEvent('Contact', { content_name: formType, source });
    trackCustomEvent('contact_submitted', { form_type: formType, source });
  },

  // Newsletter Signup
  newsletterSignup: (source: string, location?: string) => {
    trackEvent('newsletter_signup', 'engagement', source);
    trackFBEvent('Subscribe', { source, location });
    trackCustomEvent('newsletter_signup', { source, location });
  },

  // Resource Downloads
  resourceDownloaded: (resourceType: string, resourceName: string, source?: string) => {
    trackEvent('download', 'engagement', resourceName);
    trackFBEvent('ViewContent', { content_type: resourceType, content_name: resourceName, source });
    trackCustomEvent('resource_downloaded', { resource_type: resourceType, resource_name: resourceName, source });
  },

  // Video Engagement
  videoEngagement: (videoName: string, action: 'play' | 'pause' | 'complete', progress?: number) => {
    trackEvent(`video_${action}`, 'engagement', videoName, progress);
    trackCustomEvent('video_engagement', { video_name: videoName, action, progress });
  },

  // Pricing Page Events
  pricingViewed: (plan?: string) => {
    trackEvent('view_pricing', 'engagement', plan);
    trackFBEvent('ViewContent', { content_type: 'pricing', content_name: plan });
    trackCustomEvent('pricing_viewed', { plan });
  },

  // CTA Clicks
  ctaClicked: (ctaText: string, location: string, destination?: string) => {
    trackEvent('cta_click', 'engagement', `${ctaText}_${location}`);
    trackCustomEvent('cta_clicked', { cta_text: ctaText, location, destination });
  },
};

// Analytics Component
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views on route changes
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    trackPageView(url);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Initialize Google Analytics
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.gtag = window.gtag || function() {
          (window.gtag as any).q = (window.gtag as any).q || [];
          (window.gtag as any).q.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      };
    }

    // Initialize Facebook Pixel
    if (FB_PIXEL_ID && FB_PIXEL_ID !== '1234567890') {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Initialize LinkedIn Insight Tag
    if (LINKEDIN_PARTNER_ID && LINKEDIN_PARTNER_ID !== '12345') {
      window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);

      const linkedInScript = document.createElement('script');
      linkedInScript.innerHTML = `
        (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);})(window.lintrk);
      `;
      document.head.appendChild(linkedInScript);
    }

    // Track initial page load
    trackPageView(window.location.href, document.title);

    // Track scroll depth
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        trackCustomEvent('scroll_depth', { percent: scrollPercent });
      }
    };

    window.addEventListener('scroll', trackScrollDepth);
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, []);

  return null;
}

// Hook for tracking events in components
export const useAnalytics = () => {
  return {
    trackEvent,
    trackConversion,
    trackPurchase,
    trackCustomEvent,
    trackPageView,
    trackBusinessEvents,
  };
};
