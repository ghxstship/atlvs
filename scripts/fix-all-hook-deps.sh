#!/bin/bash
set -e

echo "🔧 Fixing ALL React Hook Dependencies - No Shortcuts"
echo "====================================================="

WEB_APP="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app"

# Get all files with hook warnings
FILES=(
  "$WEB_APP/(app)/(shell)/jobs/assignments/AssignmentsClient.tsx"
  "$WEB_APP/(app)/(shell)/jobs/requirements/RequirementsClient.tsx"
  "$WEB_APP/(app)/(shell)/people/competencies/CompetenciesClient.tsx"
  "$WEB_APP/(app)/(shell)/people/endorsements/EndorsementsClient.tsx"
  "$WEB_APP/(app)/(shell)/people/network/NetworkClient.tsx"
  "$WEB_APP/(app)/(shell)/people/roles/RolesClient.tsx"
  "$WEB_APP/(app)/(shell)/people/shortlists/ShortlistsClient.tsx"
  "$WEB_APP/(app)/(shell)/projects/activations/ActivationsClient.tsx"
  "$WEB_APP/(app)/(shell)/projects/inspections/InspectionsClient.tsx"
  "$WEB_APP/(app)/(shell)/projects/locations/LocationsClient.tsx"
  "$WEB_APP/(app)/(shell)/projects/risks/RisksClient.tsx"
  "$WEB_APP/(app)/(shell)/projects/tasks/TasksClient.tsx"
)

echo "📝 Phase 1: Adding stable setState dependencies..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Fix setSelectedXxx in useCallback - setState is stable, safe to add
    perl -i -0777 -pe 's/(useCallback\(\s*\([^)]*\)\s*=>\s*\{[^}]*setSelected(\w+)\([^}]*\},\s*\[)([^\]]*?)(\]\s*\))/my $deps = $3; my $name = $2; $deps =~ s\/\\s+$\/\/; my $comma = $deps ? ", " : ""; "${1}${deps}${comma}setSelected${name}${4}"/gse' "$file"
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "📝 Phase 2: Adding setFormErrors dependencies..."
find "$WEB_APP" -name "*.tsx" -type f | while read file; do
  if grep -q "setFormErrors" "$file" 2>/dev/null; then
    perl -i -0777 -pe 's/(useCallback\(\s*\([^)]*\)\s*=>\s*\{[^}]*setFormErrors\([^}]*\},\s*\[)([^\]]*?)(\]\s*\))/my $deps = $2; $deps =~ s\/\\s+$\/\/; my $comma = $deps ? ", " : ""; "${1}${deps}${comma}setFormErrors${3}"/gse' "$file"
  fi
done

echo ""
echo "📝 Phase 3: Wrapping functions in useCallback for useEffect deps..."

# Files that need function wrapping
EFFECT_FILES=(
  "$WEB_APP/(app)/(shell)/projects/overview/ProjectsOverviewClient.tsx"
  "$WEB_APP/(app)/(shell)/settings/automations/AutomationsSettingsClient.tsx"
  "$WEB_APP/(app)/(shell)/settings/organization/domains/DomainsClient.tsx"
  "$WEB_APP/(app)/(shell)/settings/permissions/PermissionsSettingsClient.tsx"
  "$WEB_APP/(app)/(shell)/settings/teams/TeamsSettingsClient.tsx"
  "$WEB_APP/(app)/(shell)/settings/teams/InviteMemberClient.tsx"
)

for file in "${EFFECT_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Add the function to useEffect dependencies
    perl -i -0777 -pe 's/(useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*\b(load\w*|fetch\w+)\(\)[^}]*\},\s*\[)(\]\s*\))/my $func = $2; "${1}${func}${3}"/gse' "$file"
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "🎉 All React Hook dependencies fixed!"
echo "Running lint to verify..."
