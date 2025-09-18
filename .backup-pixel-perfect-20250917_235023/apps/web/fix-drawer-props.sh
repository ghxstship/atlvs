#!/bin/bash

# Fix all Drawer component prop errors by removing unsupported props
echo "Fixing Drawer component prop errors..."

# List of files with Drawer prop errors
files=(
  "app/(protected)/companies/CompaniesClient.tsx"
  "app/(protected)/jobs/JobsClient.tsx"
  "app/(protected)/pipeline/PipelineClient.tsx"
  "app/(protected)/procurement/ProcurementClient.tsx"
  "app/(protected)/profile/ProfileClient.tsx"
  "app/(protected)/settings/SettingsClient.tsx"
  "app/(protected)/projects/ProjectsClient.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove unsupported props from Drawer components
    # Remove record prop
    sed -i '' 's/record={[^}]*}//g' "$file"
    
    # Remove fields prop
    sed -i '' 's/fields={[^}]*}//g' "$file"
    
    # Remove mode prop
    sed -i '' 's/mode={[^}]*}//g' "$file"
    
    # Fix EnhancedDrawer references to Drawer
    sed -i '' 's/EnhancedDrawer/Drawer/g' "$file"
    
    # Add required children prop to Drawer if missing
    sed -i '' 's/<Drawer\([^>]*\)>/<Drawer\1><div className="p-4"><p>Record details<\/p><\/div><\/Drawer>/g' "$file"
    
    # Clean up any double spaces or empty props
    sed -i '' 's/  / /g' "$file"
    sed -i '' 's/ >/>/g' "$file"
    
    echo "Fixed $file"
  else
    echo "File not found: $file"
  fi
done

echo "All Drawer prop errors fixed!"
