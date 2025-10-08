#!/bin/bash

# Deep Redundancy Analysis Script
# Identifies truly duplicate/contradictory code patterns

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
REPORT_FILE="$REPO_ROOT/DEEP_REDUNDANCY_ANALYSIS.md"
WEB_DIR="$REPO_ROOT/apps/web"

echo "# DEEP REDUNDANCY ANALYSIS REPORT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

cd "$REPO_ROOT"

echo "## 1. FILES MODULE vs PROGRAMMING MODULE OVERLAP" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "The /files/ module appears to duplicate functionality from /programming/ module:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for files that exist in both /files/ and /programming/
OVERLAP_DIRS=("call-sheets" "riders" "contracts")

for dir in "${OVERLAP_DIRS[@]}"; do
  FILES_PATH="$WEB_DIR/app/(app)/(shell)/files/$dir"
  PROG_PATH="$WEB_DIR/app/(app)/(shell)/programming/$dir"
  
  if [ -d "$FILES_PATH" ] && [ -d "$PROG_PATH" ]; then
    echo "### Duplicate: $dir" >> "$REPORT_FILE"
    echo "**Files module:** $FILES_PATH" >> "$REPORT_FILE"
    echo "**Programming module:** $PROG_PATH" >> "$REPORT_FILE"
    
    echo "" >> "$REPORT_FILE"
    echo "Files in /files/$dir/:" >> "$REPORT_FILE"
    ls -1 "$FILES_PATH" | grep -E '\.(tsx|ts)$' | head -10 >> "$REPORT_FILE"
    
    echo "" >> "$REPORT_FILE"
    echo "Files in /programming/$dir/:" >> "$REPORT_FILE"
    ls -1 "$PROG_PATH" | grep -E '\.(tsx|ts)$' | head -10 >> "$REPORT_FILE"
    
    echo "" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 2. MARKETPLACE vs OPENDECK OVERLAP" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for overlapping files between marketplace and opendeck
MARKETPLACE_CLIENTS=("ProjectPostingClient.tsx" "ProposalSystem.tsx" "MarketplaceVendorClient.tsx")

for client in "${MARKETPLACE_CLIENTS[@]}"; do
  MARKETPLACE_FILE="$WEB_DIR/app/(app)/(shell)/marketplace/$client"
  OPENDECK_FILE="$WEB_DIR/app/(app)/(shell)/opendeck/${client#Marketplace}"
  
  if [ -f "$MARKETPLACE_FILE" ]; then
    echo "- Found in marketplace: $client" >> "$REPORT_FILE"
    if [ -f "$OPENDECK_FILE" ]; then
      echo "  Also exists in opendeck: ${client#Marketplace}" >> "$REPORT_FILE"
    fi
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 3. DUPLICATE SERVICE IMPLEMENTATIONS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Find services that might be duplicated across modules
echo "Checking for service files with similar patterns..." >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# contracts-service appears in multiple places
find "$WEB_DIR/app/(app)/(shell)" -name "contracts-service.ts" | while read file; do
  echo "- $file" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "## 4. PROFILE MODULE DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for duplicate Profile clients
PROFILE_CLIENTS=(
  "$WEB_DIR/app/(app)/(shell)/profile/ProfileClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/profile/ProfileOptimizedClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/profile/overview/ProfileClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/profile/overview/ProfileOverviewClient.tsx"
)

echo "Multiple Profile client implementations found:" >> "$REPORT_FILE"
for client in "${PROFILE_CLIENTS[@]}"; do
  if [ -f "$client" ]; then
    lines=$(wc -l < "$client" 2>/dev/null || echo 0)
    echo "- $(basename $client): $lines lines" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 5. PEOPLE MODULE DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check People module for duplicates
PEOPLE_CLIENTS=(
  "$WEB_DIR/app/(app)/(shell)/people/PeopleClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/people/overview/PeopleClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/people/create/PeopleCreateClient.tsx"
)

echo "Multiple People client implementations:" >> "$REPORT_FILE"
for client in "${PEOPLE_CLIENTS[@]}"; do
  if [ -f "$client" ]; then
    lines=$(wc -l < "$client" 2>/dev/null || echo 0)
    echo "- $(basename $(dirname $client))/$(basename $client): $lines lines" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 6. DUPLICATE UTILITY FILES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Find duplicate utility patterns
UTIL_PATTERNS=("monitoring.ts" "i18n.ts" "middleware.ts" "validations.ts" "feature-flags.ts")

for pattern in "${UTIL_PATTERNS[@]}"; do
  echo "### Files matching: $pattern" >> "$REPORT_FILE"
  find "$WEB_DIR" -name "$pattern" ! -path "*/node_modules/*" ! -path "*/.next/*" | while read file; do
    rel_path=${file#$REPO_ROOT/}
    echo "- $rel_path" >> "$REPORT_FILE"
  done
  echo "" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "## 7. PROGRAMMING MODULE INTERNAL DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for duplicate client patterns in programming module
PROG_DIR="$WEB_DIR/app/(app)/(shell)/programming"
for subdir in call-sheets events itineraries lineups performances riders spaces workshops; do
  subdir_path="$PROG_DIR/$subdir"
  if [ -d "$subdir_path" ]; then
    client_count=$(find "$subdir_path" -maxdepth 1 -name "*Client.tsx" | wc -l)
    if [ $client_count -gt 1 ]; then
      echo "### $subdir has multiple clients:" >> "$REPORT_FILE"
      find "$subdir_path" -maxdepth 1 -name "*Client.tsx" -exec basename {} \; >> "$REPORT_FILE"
      echo "" >> "$REPORT_FILE"
    fi
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 8. FINANCE MODULE DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check finance module for duplicate create clients
FINANCE_DIR="$WEB_DIR/app/(app)/(shell)/finance"
for subdir in budgets expenses forecasts invoices revenue transactions; do
  subdir_path="$FINANCE_DIR/$subdir"
  if [ -d "$subdir_path" ]; then
    # Check for both direct CreateClient and create/CreateClient patterns
    create_clients=$(find "$subdir_path" -name "Create*Client.tsx" | wc -l)
    if [ $create_clients -gt 1 ]; then
      echo "### $subdir has multiple create clients:" >> "$REPORT_FILE"
      find "$subdir_path" -name "Create*Client.tsx" | while read file; do
        rel=${file#$FINANCE_DIR/$subdir/}
        echo "- $rel" >> "$REPORT_FILE"
      done
      echo "" >> "$REPORT_FILE"
    fi
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 9. JOBS MODULE DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check jobs module
JOBS_CLIENTS=(
  "$WEB_DIR/app/(app)/(shell)/jobs/JobsClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/jobs/overview/JobsClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/jobs/overview/OverviewClient.tsx"
)

echo "Multiple Jobs client implementations:" >> "$REPORT_FILE"
for client in "${JOBS_CLIENTS[@]}"; do
  if [ -f "$client" ]; then
    lines=$(wc -l < "$client" 2>/dev/null || echo 0)
    rel=${client#$WEB_DIR/}
    echo "- $rel: $lines lines" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 10. CHROMELESS LAYOUT DUPLICATES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for files that exist in both (chromeless) and (shell)
CHROMELESS_DIR="$WEB_DIR/app/(app)/(chromeless)"
if [ -d "$CHROMELESS_DIR" ]; then
  echo "Files in (chromeless) layout that might duplicate (shell):" >> "$REPORT_FILE"
  find "$CHROMELESS_DIR" -name "*Client.tsx" | while read file; do
    basename_file=$(basename $(dirname $file))/$(basename $file)
    echo "- $basename_file" >> "$REPORT_FILE"
  done
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "✅ Deep redundancy analysis complete!" >> "$REPORT_FILE"
echo "📄 Report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"
