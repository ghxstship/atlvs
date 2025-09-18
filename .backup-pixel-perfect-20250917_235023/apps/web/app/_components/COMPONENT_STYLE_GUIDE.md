# GHXSTSHIP Marketing Component Style Guide

## Overview

This document outlines the standardized component usage, styling patterns, and UI consistency guidelines for all GHXSTSHIP marketing pages. Following this guide ensures a cohesive, accessible, and modern user experience across the entire marketing site.

## Core Design Principles

### 1. Drawer-First UX Pattern
- All interactive elements follow a "drawer-first" approach
- Consistent button styling with hover and focus states
- Smooth transitions and micro-animations for enhanced user feedback

### 2. Typography Hierarchy
- **Headers**: ANTON font (ALL CAPS) for titles and section headers
- **Body Text**: Share Tech for readable content
- **Fine Print**: Share Tech Mono for technical details and metadata

### 3. Accessibility Standards
- WCAG 2.2 AA compliance across all components
- Focus-visible rings and outlines on interactive elements
- Screen reader support with proper ARIA labels
- Keyboard navigation support

## Button Standards

### Base Button Styling
All buttons should include these consistent properties:

```tsx
<Button className="group transition-all duration-200 hover:scale-105">
  Button Text
  <Icon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
</Button>
```

### Button Variants and Usage

#### Primary CTA Buttons
- **Variant**: Default (primary)
- **Size**: `lg` for hero sections, default for general use
- **Hover Effect**: `hover:scale-105` with `duration-200` transition
- **Icon Animation**: `group-hover:translate-x-1` for right-pointing icons

#### Secondary Buttons
- **Variant**: `outline`
- **Same hover effects as primary buttons
- **Used for secondary actions and alternative CTAs

#### Ghost Buttons
- **Variant**: `ghost`
- **Size**: `sm` for subtle actions
- **Used within cards and for less prominent actions

### Button Group Layout
```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Link href="/primary-action">
    <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105">
      Primary Action
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </Link>
  <Link href="/secondary-action">
    <Button variant="outline" className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
      Secondary Action
    </Button>
  </Link>
</div>
```

## Card Components

### Standard Card Pattern
```tsx
<Card className="hover:shadow-lg transition-all duration-300 group h-full">
  <CardContent className="p-6 sm:p-8">
    {/* Icon with hover scale */}
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="h-8 w-8 text-white" />
    </div>
    
    {/* Title with hover color change */}
    <h3 className="group-hover:text-primary transition-colors mb-3">
      Card Title
    </h3>
    
    {/* Content */}
    <p className="text-muted-foreground mb-4">
      Card description content
    </p>
    
    {/* Action with translate animation */}
    <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
      Learn More
      <ArrowRight className="ml-1 h-4 w-4" />
    </div>
  </CardContent>
</Card>
```

## Badge Usage

### Standard Badge Variants
- **Outline**: For categories and labels
- **Default**: For status indicators and highlights
- **Secondary**: For counts and metadata

```tsx
<Badge variant="outline" className="mb-4">
  Category Label
</Badge>
```

## Icon Standards

### Icon Library
- **Primary**: Lucide React icons for consistency
- **Size**: `h-4 w-4` for inline icons, `h-8 w-8` for feature icons
- **Animation**: `group-hover:translate-x-1` for directional feedback

### Icon Animation Patterns
```tsx
{/* Standard right-pointing icon animation */}
<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

{/* Icon scale animation in cards */}
<Icon className="h-8 w-8 transition-transform group-hover:scale-110" />
```

## Layout Components

### Section Structure
```tsx
import { Section, SectionHeader } from '../components/layout/Section';

<Section variant="hero">
  <SectionHeader 
    badge="Section Badge"
    title={<>SECTION<br />TITLE</>}
    subtitle="Section description text"
  />
  {/* Section content */}
</Section>
```

### Grid Layouts
- **Pricing**: `layouts.gridPricing` for pricing card grids
- **Features**: `grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`
- **Cards**: `grid lg:grid-cols-3 gap-8` for feature cards

## Marketing-Specific Components

### Hero Section
```tsx
import { HeroSection } from '../components/HeroSection';

<HeroSection
  badge="Hero Badge"
  title="HERO TITLE"
  subtitle="Hero description"
  primaryCTA={{
    text: "Get Started",
    href: "/signup"
  }}
  secondaryCTA={{
    text: "Learn More",
    href: "/about"
  }}
/>
```

### Feature Cards
```tsx
import { FeatureCard } from '../components/ui/FeatureCard';

<FeatureCard
  variant="default"
  icon={FeatureIcon}
  title="Feature Title"
  description="Feature description"
  badge="New"
/>
```

### CTA Sections
```tsx
import { CTASection } from '../components/CTASection';

<CTASection
  variant="primary"
  title="CTA TITLE"
  subtitle="CTA description"
  primaryAction={{
    text: "Start Trial",
    href: "/signup"
  }}
  secondaryAction={{
    text: "Contact Sales",
    href: "/contact"
  }}
/>
```

## Animation Standards

### Transition Durations
- **Fast**: `duration-200` for button hovers and quick interactions
- **Standard**: `duration-300` for card hovers and medium transitions
- **Slow**: `duration-500` for page transitions and complex animations

### Transform Effects
- **Scale**: `hover:scale-105` for buttons and interactive elements
- **Translate**: `group-hover:translate-x-1` for icons and directional feedback
- **Scale (Icons)**: `group-hover:scale-110` for feature icons in cards

### Hover States
All interactive elements should include:
1. **Smooth transitions**: `transition-all duration-200`
2. **Scale effect**: `hover:scale-105` for buttons
3. **Color changes**: `group-hover:text-primary` for text elements
4. **Icon animations**: `group-hover:translate-x-1` for arrows

## Color and Theming

### Gradient Usage
- **Hero Titles**: `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`
- **Card Icons**: `bg-gradient-to-r from-{color}-500 to-{color}-600`
- **Backgrounds**: `bg-gradient-to-br from-background via-background to-muted/20`

### Color Variants
- **Primary**: Blue-based gradients for main CTAs
- **Secondary**: Purple-based gradients for highlights
- **Muted**: Gray-based colors for backgrounds and subtle elements

## Responsive Design

### Breakpoint Strategy
- **Mobile First**: Start with mobile layout, enhance for larger screens
- **Flex Direction**: `flex-col sm:flex-row` for button groups
- **Grid Responsive**: `grid md:grid-cols-2 lg:grid-cols-3`
- **Width Control**: `w-full sm:w-auto` for buttons

### Mobile Considerations
- Full-width buttons on mobile: `w-full sm:w-auto`
- Stacked layouts: `flex-col sm:flex-row`
- Appropriate spacing: `gap-4` for mobile, `gap-6 lg:gap-8` for desktop

## Component Import Standards

### Centralized Imports
Always import from the centralized component index:
```tsx
import { 
  HeroSection, 
  FeatureCard, 
  CTASection 
} from '../components';
```

### UI Component Imports
```tsx
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Icon } from 'lucide-react';
```

## Performance Considerations

### Lazy Loading
- Use Next.js `Image` component for optimized images
- Implement lazy loading for non-critical sections
- Optimize icon imports to reduce bundle size

### Animation Performance
- Use CSS transforms for animations (GPU-accelerated)
- Prefer `transform` over changing layout properties
- Use `will-change` sparingly and remove after animations

## Accessibility Checklist

### Interactive Elements
- [ ] All buttons have proper focus states
- [ ] Keyboard navigation works correctly
- [ ] Screen reader labels are present
- [ ] Color contrast meets WCAG AA standards

### Content Structure
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for all images
- [ ] Semantic HTML elements used correctly
- [ ] ARIA labels where needed

## Testing Guidelines

### Cross-Browser Testing
- Test hover effects in Chrome, Firefox, Safari
- Verify animations work smoothly across devices
- Check responsive behavior on various screen sizes

### Accessibility Testing
- Use screen reader to navigate pages
- Test keyboard-only navigation
- Verify color contrast ratios
- Check focus indicators visibility

## Common Patterns to Avoid

### ❌ Inconsistent Button Styling
```tsx
// Don't do this
<Button className="hover:bg-blue-500">
  Inconsistent Button
</Button>
```

### ❌ Missing Transitions
```tsx
// Don't do this
<Button className="hover:scale-105">
  No Transition
</Button>
```

### ❌ Inconsistent Icon Usage
```tsx
// Don't do this
<ArrowRight className="ml-2 h-5 w-5" /> // Wrong size
```

### ✅ Correct Implementation
```tsx
// Do this instead
<Button className="group transition-all duration-200 hover:scale-105">
  Consistent Button
  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
</Button>
```

## Maintenance Guidelines

### Regular Audits
- Review component usage quarterly
- Check for consistency across new pages
- Update this guide when patterns change
- Monitor performance impact of animations

### Version Control
- Document component changes in commit messages
- Use semantic versioning for major component updates
- Maintain backward compatibility when possible

---

## Quick Reference

### Standard Button Pattern
```tsx
<Button className="group transition-all duration-200 hover:scale-105">
  Text
  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
</Button>
```

### Standard Card Pattern
```tsx
<Card className="hover:shadow-lg transition-all duration-300 group">
  <CardContent className="p-6">
    <Icon className="group-hover:scale-110 transition-transform" />
    <h3 className="group-hover:text-primary transition-colors">Title</h3>
  </CardContent>
</Card>
```

### Standard Link Wrapper
```tsx
<Link href="/path">
  <Button asChild className="group transition-all duration-200 hover:scale-105">
    <a>Button Content</a>
  </Button>
</Link>
```

This style guide ensures consistent, accessible, and performant UI components across all GHXSTSHIP marketing pages.
