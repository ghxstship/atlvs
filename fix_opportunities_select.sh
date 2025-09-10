#!/bin/bash

file="apps/web/app/(protected)/jobs/opportunities/OpportunitiesClient.tsx"

echo "Fixing OpportunitiesClient Select components..."

# Fix all onChange to onValueChange
sed -i '' 's/onChange={(e) => setTypeFilter(e.target.value)}/onValueChange={setTypeFilter}/g' "$file"
sed -i '' 's/onChange={(e) => setSortBy(e.target.value)}/onValueChange={setSortBy}/g' "$file"
sed -i '' 's/onChange={(e) => setSortOrder(e.target.value)}/onValueChange={setSortOrder}/g' "$file"

# Remove invalid props like name and required from Select
sed -i '' 's/ name="[^"]*"//g' "$file"
sed -i '' 's/ required//g' "$file"

echo "OpportunitiesClient fixed!"
