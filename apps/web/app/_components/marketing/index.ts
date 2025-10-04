// Centralized component exports for marketing pages
// This file optimizes imports and provides a single source of truth for all marketing components

// Only export components that actually exist

// Core Marketing Components
export { MarketingHeader } from './MarketingHeader';
export { MarketingFooter } from './MarketingFooter';
export { CookieConsent } from './CookieConsent';
export { default as Analytics } from './Analytics';
export { default as PerformanceOptimizations } from './PerformanceOptimizations';
export { default as AccessibilityEnhancements } from './AccessibilityEnhancements';

// Export actual components that exist in this directory
export { HeroSection } from './HeroSection';
export { ProductHighlights } from './ProductHighlights';
export { TrustSignals } from './TrustSignals';
export { SocialProof } from './SocialProof';
export { FeatureGrid } from './FeatureGrid';
export { CTASection } from './CTASection';
export { MarketingSection, MarketingSectionHeader, MarketingCard, MarketingStatGrid } from './layout/Section';
