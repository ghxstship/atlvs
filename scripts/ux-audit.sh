#!/bin/bash

# UX Excellence Audit
# Validates loading states, error handling, animations, and responsive design

set -e

echo "🎨 GHXSTSHIP UX Excellence Audit - Starting..."
echo "=============================================="

ISSUES_FOUND=0

# 1. Check for loading states
echo ""
echo "1️⃣ Checking for loading states..."
LOADING_STATES=$(grep -r "loading\|isLoading\|Loading\|Skeleton" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$LOADING_STATES" -gt 50 ]; then
  echo "✅ Comprehensive loading states ($LOADING_STATES instances)"
else
  echo "⚠️  Limited loading state implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 2. Check for error states
echo ""
echo "2️⃣ Checking for error handling UI..."
ERROR_STATES=$(grep -r "error\|Error\|ErrorBoundary" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$ERROR_STATES" -gt 100 ]; then
  echo "✅ Comprehensive error handling ($ERROR_STATES instances)"
else
  echo "⚠️  May need more error handling UI"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for ErrorBoundary components
if grep -r "ErrorBoundary" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null > /dev/null; then
  echo "✅ Error boundaries implemented"
else
  echo "⚠️  No error boundaries found"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 3. Check for empty states
echo ""
echo "3️⃣ Checking for empty states..."
EMPTY_STATES=$(grep -r "empty\|Empty\|no data\|No data\|EmptyState" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$EMPTY_STATES" -gt 20 ]; then
  echo "✅ Good empty state coverage ($EMPTY_STATES instances)"
else
  echo "⚠️  Limited empty state implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 4. Check for micro-interactions
echo ""
echo "4️⃣ Checking for micro-interactions..."
HOVER_EFFECTS=$(grep -r "hover:\|onHover\|onMouseEnter" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$HOVER_EFFECTS" -gt 50 ]; then
  echo "✅ Good hover/interaction implementation ($HOVER_EFFECTS instances)"
else
  echo "⚠️  Limited micro-interactions"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Check for animations
echo ""
echo "5️⃣ Checking for animations..."
ANIMATIONS=$(grep -r "animate\|transition\|framer-motion\|Animation" \
  --include="*.tsx" \
  --include="*.jsx" \
  --include="*.css" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$ANIMATIONS" -gt 30 ]; then
  echo "✅ Animations implemented ($ANIMATIONS instances)"
else
  echo "⚠️  Limited animation implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Check for keyboard shortcuts
echo ""
echo "6️⃣ Checking for keyboard shortcuts..."
if grep -r "useHotkeys\|keyboard shortcut\|kbd" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null > /dev/null; then
  echo "✅ Keyboard shortcuts implemented"
else
  echo "⚠️  No keyboard shortcuts detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 7. Check for responsive design
echo ""
echo "7️⃣ Checking for responsive design..."
RESPONSIVE=$(grep -r "sm:\|md:\|lg:\|xl:\|2xl:\|responsive" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$RESPONSIVE" -gt 200 ]; then
  echo "✅ Comprehensive responsive design ($RESPONSIVE breakpoints)"
else
  echo "⚠️  Limited responsive design implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 8. Check for offline support
echo ""
echo "8️⃣ Checking for offline support..."
if grep -r "offline\|serviceWorker\|PWA\|navigator.onLine" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  . 2>/dev/null > /dev/null; then
  echo "✅ Offline support implemented"
else
  echo "⚠️  No offline support detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 9. Check for toast/notification system
echo ""
echo "9️⃣ Checking for notification system..."
if grep -r "toast\|Toast\|notification\|Notification" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null > /dev/null; then
  echo "✅ Notification system implemented"
else
  echo "⚠️  No notification system detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 10. Check for form validation feedback
echo ""
echo "🔟 Checking for form validation..."
FORM_VALIDATION=$(grep -r "react-hook-form\|Zod\|validation\|error\\.message" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$FORM_VALIDATION" -gt 50 ]; then
  echo "✅ Comprehensive form validation ($FORM_VALIDATION instances)"
else
  echo "⚠️  Limited form validation implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Summary
echo ""
echo "=============================================="
echo "📊 UX Excellence Audit Complete"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All UX checks passed!"
  echo ""
  echo "💡 UX highlights:"
  echo "  - $LOADING_STATES loading states"
  echo "  - $ERROR_STATES error handling instances"
  echo "  - $EMPTY_STATES empty states"
  echo "  - $ANIMATIONS animations"
  echo "  - $RESPONSIVE responsive breakpoints"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND UX areas for improvement"
  echo ""
  echo "💡 Recommended actions:"
  echo "  1. Add skeleton screens for all loading states"
  echo "  2. Implement error boundaries and user-friendly error messages"
  echo "  3. Create engaging empty states with clear actions"
  echo "  4. Add hover effects and micro-interactions"
  echo "  5. Ensure 60fps animations with GPU acceleration"
  echo "  6. Implement power user keyboard shortcuts"
  echo "  7. Test responsive design across all breakpoints"
  echo "  8. Add offline detection and graceful degradation"
  echo "  9. Implement toast notification system"
  echo "  10. Add comprehensive form validation with helpful error messages"
  echo ""
  echo "📚 Resources:"
  echo "  - React Hook Form: https://react-hook-form.com/"
  echo "  - Framer Motion: https://www.framer.com/motion/"
  echo "  - Radix UI: https://www.radix-ui.com/"
  exit 1
fi
