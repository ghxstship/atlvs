#!/bin/bash

# Deep Cleanup Script - Removes true duplicates and contradictory code
# CRITICAL: Creates backup before any deletion

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
BACKUP_DIR="$REPO_ROOT/.deep-cleanup-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$REPO_ROOT/DEEP_CLEANUP_LOG.md"
WEB_DIR="$REPO_ROOT/apps/web"

echo "# DEEP CLEANUP EXECUTION LOG" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Create backup
mkdir -p "$BACKUP_DIR"
echo "✅ Created backup directory: $BACKUP_DIR" | tee -a "$LOG_FILE"

cd "$REPO_ROOT"

echo "" >> "$LOG_FILE"
echo "## PHASE 1: FILES/PROGRAMMING MODULE OVERLAP" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "⚠️ CRITICAL: Removing duplicate call-sheets and riders from /files/ module" >> "$LOG_FILE"
echo "These are exact duplicates of /programming/ versions" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Backup and remove /files/call-sheets (duplicate of /programming/call-sheets)
if [ -d "$WEB_DIR/app/(app)/(shell)/files/call-sheets" ]; then
  cp -r "$WEB_DIR/app/(app)/(shell)/files/call-sheets" "$BACKUP_DIR/"
  rm -rf "$WEB_DIR/app/(app)/(shell)/files/call-sheets"
  echo "- Removed: /files/call-sheets/ (duplicates /programming/call-sheets/)" >> "$LOG_FILE"
fi

# Backup and remove /files/riders (duplicate of /programming/riders)
if [ -d "$WEB_DIR/app/(app)/(shell)/files/riders" ]; then
  cp -r "$WEB_DIR/app/(app)/(shell)/files/riders" "$BACKUP_DIR/"
  rm -rf "$WEB_DIR/app/(app)/(shell)/files/riders"
  echo "- Removed: /files/riders/ (duplicates /programming/riders/)" >> "$LOG_FILE"
fi

# Backup and remove /files/contracts (if it exists and duplicates other contracts modules)
if [ -d "$WEB_DIR/app/(app)/(shell)/files/contracts" ]; then
  cp -r "$WEB_DIR/app/(app)/(shell)/files/contracts" "$BACKUP_DIR/"
  rm -rf "$WEB_DIR/app/(app)/(shell)/files/contracts"
  echo "- Removed: /files/contracts/ (functionality exists in companies/contracts and marketplace/contracts)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "## PHASE 2: MARKETPLACE/OPENDECK OVERLAP" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove duplicate files from opendeck (keep marketplace versions as canonical)
OPENDECK_DUPLICATES=(
  "$WEB_DIR/app/(app)/(shell)/opendeck/ProjectPostingClient.tsx"
  "$WEB_DIR/app/(app)/(shell)/opendeck/ProposalSystem.tsx"
)

for file in "${OPENDECK_DUPLICATES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    rm "$file"
    filename=$(basename "$file")
    echo "- Removed: /opendeck/$filename (duplicates /marketplace/$filename)" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 3: DUPLICATE UTILITY FILES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove duplicate utility files (keep lib/ versions)
DUPLICATE_UTILS=(
  "apps/web/app/lib/feature-flags.ts"
  "apps/web/i18n.ts"
)

for util in "${DUPLICATE_UTILS[@]}"; do
  if [ -f "$REPO_ROOT/$util" ]; then
    cp "$REPO_ROOT/$util" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$util"
    echo "- Removed duplicate utility: $util" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 4: FINANCE MODULE CREATE CLIENT DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove create/ subdirectory versions (keep root level CreateClients)
FINANCE_CREATE_DUPS=(
  "forecasts/create/CreateForecastClient.tsx"
  "invoices/create/CreateInvoiceClient.tsx"
  "revenue/create/CreateRevenueClient.tsx"
  "transactions/create/CreateTransactionClient.tsx"
)

for dup in "${FINANCE_CREATE_DUPS[@]}"; do
  file="$WEB_DIR/app/(app)/(shell)/finance/$dup"
  if [ -f "$file" ]; then
    mkdir -p "$BACKUP_DIR/finance/"
    cp "$file" "$BACKUP_DIR/finance/"
    rm "$file"
    echo "- Removed: /finance/$dup (duplicates root level version)" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 5: PROGRAMMING MODULE INTERNAL DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# For each programming submodule, keep only the "Programming*Client.tsx" version
# Remove generic named versions (e.g., CallSheetsClient.tsx when ProgrammingCallSheetsClient.tsx exists)
PROG_DIR="$WEB_DIR/app/(app)/(shell)/programming"
PROG_SUBDIRS=("call-sheets" "events" "itineraries" "lineups" "performances" "riders" "spaces" "workshops")

for subdir in "${PROG_SUBDIRS[@]}"; do
  subdir_path="$PROG_DIR/$subdir"
  if [ -d "$subdir_path" ]; then
    # Convert subdir name to PascalCase
    subdir_pascal=$(echo "$subdir" | sed -r 's/(^|-)([a-z])/\U\2/g' | sed 's/-//g')
    
    # Generic client name
    generic_client="${subdir_pascal}Client.tsx"
    programming_client="Programming${subdir_pascal}Client.tsx"
    
    generic_path="$subdir_path/$generic_client"
    programming_path="$subdir_path/$programming_client"
    
    # If both exist, remove the generic one
    if [ -f "$generic_path" ] && [ -f "$programming_path" ]; then
      cp "$generic_path" "$BACKUP_DIR/"
      rm "$generic_path"
      echo "- Removed: /programming/$subdir/$generic_client (keeping Programming${subdir_pascal}Client.tsx)" >> "$LOG_FILE"
    fi
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 6: JOBS MODULE DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# In jobs/overview/, we have both JobsClient.tsx and OverviewClient.tsx
# Keep OverviewClient.tsx as it's more specific
JOBS_DUP="$WEB_DIR/app/(app)/(shell)/jobs/overview/JobsClient.tsx"
if [ -f "$JOBS_DUP" ]; then
  cp "$JOBS_DUP" "$BACKUP_DIR/"
  rm "$JOBS_DUP"
  echo "- Removed: /jobs/overview/JobsClient.tsx (keeping OverviewClient.tsx)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "## PHASE 7: PEOPLE MODULE DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# In people/overview/, we have both PeopleClient.tsx and OverviewClient.tsx
# Keep OverviewClient.tsx
PEOPLE_DUP="$WEB_DIR/app/(app)/(shell)/people/overview/PeopleClient.tsx"
if [ -f "$PEOPLE_DUP" ]; then
  cp "$PEOPLE_DUP" "$BACKUP_DIR/"
  rm "$PEOPLE_DUP"
  echo "- Removed: /people/overview/PeopleClient.tsx (keeping OverviewClient.tsx)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "## PHASE 8: PROFILE MODULE DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep ProfileClient.tsx in root, remove ProfileOptimizedClient.tsx
PROFILE_OPT="$WEB_DIR/app/(app)/(shell)/profile/ProfileOptimizedClient.tsx"
if [ -f "$PROFILE_OPT" ]; then
  cp "$PROFILE_OPT" "$BACKUP_DIR/"
  rm "$PROFILE_OPT"
  echo "- Removed: /profile/ProfileOptimizedClient.tsx (keeping ProfileClient.tsx)" >> "$LOG_FILE"
fi

# In profile/overview/, keep ProfileClient.tsx, remove ProfileOverviewClient.tsx
PROFILE_OVERVIEW_DUP="$WEB_DIR/app/(app)/(shell)/profile/overview/ProfileOverviewClient.tsx"
if [ -f "$PROFILE_OVERVIEW_DUP" ]; then
  cp "$PROFILE_OVERVIEW_DUP" "$BACKUP_DIR/"
  rm "$PROFILE_OVERVIEW_DUP"
  echo "- Removed: /profile/overview/ProfileOverviewClient.tsx (keeping ProfileClient.tsx)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "## PHASE 9: PROGRAMMING MODULE ROOT DUPLICATES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# In programming/, keep ProgrammingClient.tsx, remove duplicate from overview/
PROG_OVERVIEW_DUP="$WEB_DIR/app/(app)/(shell)/programming/overview/ProgrammingClient.tsx"
if [ -f "$PROG_OVERVIEW_DUP" ]; then
  cp "$PROG_OVERVIEW_DUP" "$BACKUP_DIR/"
  rm "$PROG_OVERVIEW_DUP"
  echo "- Removed: /programming/overview/ProgrammingClient.tsx (keeping root ProgrammingClient.tsx)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "## CLEANUP SUMMARY" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "- Backup location: $BACKUP_DIR" >> "$LOG_FILE"
echo "- Total items backed up: $(ls -1 "$BACKUP_DIR" | wc -l)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "✅ Deep cleanup complete!" | tee -a "$LOG_FILE"
echo "📁 Backup created at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📄 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
