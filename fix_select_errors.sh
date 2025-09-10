#!/bin/bash

# Files to fix - remove error prop from Select components
files=(
  "apps/web/app/(protected)/jobs/contracts/CreateContractClient.tsx"
  "apps/web/app/(protected)/jobs/opportunities/CreateOpportunityClient.tsx"
  "apps/web/app/(protected)/jobs/rfps/CreateRfpClient.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Remove error prop from Select components
  sed -i '' 's/ error={errors\.[^}]*\.message}//g' "$file"
done

echo "All Select error props removed!"
