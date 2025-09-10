#!/bin/bash

file="apps/web/app/(protected)/opendeck/ProjectPostingClient.tsx"

echo "Fixing ProjectPostingClient Button variants and props..."

# Fix invalid variant "default" to "primary"
sed -i '' 's/variant="default"/variant="primary"/g' "$file"

# Fix Button width prop to size prop
sed -i '' 's/width="sm"/size="sm"/g' "$file"

echo "ProjectPostingClient fixed!"
