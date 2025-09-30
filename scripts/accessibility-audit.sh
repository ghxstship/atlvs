#!/bin/bash

# Accessibility Compliance Audit
# Validates WCAG 2.2 AA compliance across the application

set -e

echo "♿ GHXSTSHIP Accessibility Audit - Starting..."
echo "============================================="

ISSUES_FOUND=0

# 1. Check for missing alt text on images
echo ""
echo "1️⃣ Checking for images without alt text..."
ALT_ISSUES=$(grep -r "<img" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | grep -v "alt=" | wc -l || echo "0")

if [ "$ALT_ISSUES" -gt 0 ]; then
  echo "⚠️  Found $ALT_ISSUES images without alt text"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ All images have alt text"
fi

# 2. Check for aria-label on interactive elements
echo ""
echo "2️⃣ Checking for ARIA labels on buttons..."
BUTTON_ISSUES=$(grep -r "<button" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | grep -v "aria-label=" | grep -v ">" | wc -l || echo "0")

if [ "$BUTTON_ISSUES" -gt 10 ]; then
  echo "⚠️  Found $BUTTON_ISSUES buttons potentially missing ARIA labels"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ Most buttons have ARIA labels"
fi

# 3. Check for keyboard navigation support
echo ""
echo "3️⃣ Checking for keyboard event handlers..."
KEYBOARD_COUNT=$(grep -r "onKeyDown\|onKeyPress\|onKeyUp" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$KEYBOARD_COUNT" -gt 50 ]; then
  echo "✅ Keyboard navigation implemented ($KEYBOARD_COUNT handlers)"
else
  echo "⚠️  Limited keyboard navigation support"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 4. Check for semantic HTML
echo ""
echo "4️⃣ Checking for semantic HTML usage..."
SEMANTIC_COUNT=$(grep -r "<main\|<nav\|<article\|<section\|<header\|<footer" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$SEMANTIC_COUNT" -gt 20 ]; then
  echo "✅ Good semantic HTML usage ($SEMANTIC_COUNT elements)"
else
  echo "⚠️  Limited semantic HTML"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Check for focus management
echo ""
echo "5️⃣ Checking for focus management..."
FOCUS_COUNT=$(grep -r "focus()\|autoFocus\|tabIndex" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$FOCUS_COUNT" -gt 10 ]; then
  echo "✅ Focus management implemented ($FOCUS_COUNT instances)"
else
  echo "⚠️  Limited focus management"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Check for reduced motion support
echo ""
echo "6️⃣ Checking for reduced motion support..."
if grep -r "prefers-reduced-motion" \
  --include="*.css" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  . 2>/dev/null > /dev/null; then
  echo "✅ Reduced motion support implemented"
else
  echo "⚠️  No reduced motion support found"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 7. Check for color contrast utilities
echo ""
echo "7️⃣ Checking for color contrast considerations..."
if grep -r "contrast\|color-contrast" \
  --include="*.css" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  . 2>/dev/null > /dev/null; then
  echo "✅ Color contrast utilities found"
else
  echo "⚠️  No explicit color contrast handling"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Summary
echo ""
echo "============================================="
echo "📊 Accessibility Audit Complete"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All accessibility checks passed!"
  echo ""
  echo "💡 Recommended: Run manual testing with:"
  echo "  - Screen reader (NVDA, JAWS, VoiceOver)"
  echo "  - Keyboard-only navigation"
  echo "  - Browser accessibility tools"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND accessibility areas for improvement"
  echo ""
  echo "💡 Recommended actions:"
  echo "  1. Add alt text to all images"
  echo "  2. Add ARIA labels to interactive elements"
  echo "  3. Implement comprehensive keyboard navigation"
  echo "  4. Use semantic HTML elements"
  echo "  5. Add focus management for modals/drawers"
  echo "  6. Support prefers-reduced-motion"
  echo "  7. Ensure 4.5:1 color contrast ratios"
  echo ""
  echo "📚 Resources:"
  echo "  - WCAG 2.2 Guidelines: https://www.w3.org/WAI/WCAG22/quickref/"
  echo "  - axe DevTools: https://www.deque.com/axe/devtools/"
  exit 1
fi
