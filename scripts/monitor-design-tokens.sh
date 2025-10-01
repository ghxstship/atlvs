#!/bin/bash
# Monitor design token violations over time
# Usage: ./scripts/monitor-design-tokens.sh

set -e

REPORT_DIR="docs/violation-reports"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/violations_$TIMESTAMP.json"

echo "🔍 Running design token audit..."
npm run audit:design-tokens > "$REPORT_FILE" 2>&1 || true

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Install with: brew install jq"
    echo "📁 Report saved to: $REPORT_FILE"
    exit 0
fi

# Extract violation count (adjust based on actual output format)
VIOLATION_COUNT=$(grep -o "Total violations: [0-9]*" "$REPORT_FILE" | grep -o "[0-9]*" || echo "0")

echo "📊 Total violations: $VIOLATION_COUNT"
echo "📁 Report saved to: $REPORT_FILE"

# Track progress
BASELINE_FILE="$REPORT_DIR/baseline.txt"
if [ -f "$BASELINE_FILE" ]; then
  BASELINE_COUNT=$(cat "$BASELINE_FILE")
  IMPROVEMENT=$((BASELINE_COUNT - VIOLATION_COUNT))
  
  if [ $IMPROVEMENT -gt 0 ]; then
    echo "📈 Improvement: $IMPROVEMENT violations fixed! 🎉"
  elif [ $IMPROVEMENT -lt 0 ]; then
    echo "⚠️  Warning: $((IMPROVEMENT * -1)) new violations introduced"
  else
    echo "➡️  No change in violation count"
  fi
  
  # Calculate percentage
  if [ $BASELINE_COUNT -gt 0 ]; then
    PERCENTAGE=$((100 - (VIOLATION_COUNT * 100 / BASELINE_COUNT)))
    echo "📊 Progress: ${PERCENTAGE}% complete"
  fi
else
  echo "📌 Setting baseline: $VIOLATION_COUNT violations"
  echo "$VIOLATION_COUNT" > "$BASELINE_FILE"
fi

# Create simple progress chart
echo ""
echo "📈 Progress Chart:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$BASELINE_FILE" ]; then
  BASELINE_COUNT=$(cat "$BASELINE_FILE")
  if [ $BASELINE_COUNT -gt 0 ]; then
    REMAINING_PERCENTAGE=$((VIOLATION_COUNT * 100 / BASELINE_COUNT))
    COMPLETED_PERCENTAGE=$((100 - REMAINING_PERCENTAGE))
    
    # Create bar chart
    COMPLETED_BARS=$((COMPLETED_PERCENTAGE / 5))
    REMAINING_BARS=$((20 - COMPLETED_BARS))
    
    printf "["
    printf "█%.0s" $(seq 1 $COMPLETED_BARS)
    printf "░%.0s" $(seq 1 $REMAINING_BARS)
    printf "] %d%%\n" $COMPLETED_PERCENTAGE
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Baseline: $BASELINE_COUNT | Current: $VIOLATION_COUNT | Remaining: $((VIOLATION_COUNT))"
  fi
fi

echo ""
echo "✅ Monitoring complete!"
