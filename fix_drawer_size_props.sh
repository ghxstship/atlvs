#!/bin/bash

# Files with size="xl" that need to be changed to width="xl"
files=(
  "apps/web/app/(protected)/procurement/orders/CreateOrderClient.tsx"
  "apps/web/app/(protected)/procurement/catalog/CreateCatalogItemClient.tsx"
  "apps/web/app/(protected)/projects/locations/LocationsTableClient.tsx"
  "apps/web/app/(protected)/pipeline/onboarding/CreateOnboardingTaskClient.tsx"
  "apps/web/app/(protected)/projects/risks/RisksTableClient.tsx"
  "apps/web/app/(protected)/projects/overview/ProjectsTableClient.tsx"
  "apps/web/app/(protected)/projects/tasks/TasksTableClient.tsx"
  "apps/web/app/(protected)/pipeline/training/CreateTrainingClient.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Replace size="xl" with width="xl" for Drawer components
  sed -i '' 's/size="xl"/width="xl"/g' "$file"
done

echo "All Drawer size props fixed!"
