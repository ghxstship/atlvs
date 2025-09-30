#!/bin/bash

# Fix incomplete PaginatedApiResponse generic types
cd "apps/web"

echo "🔧 Fixing PaginatedApiResponse<> patterns..."

# Fix Promise<PaginatedApiResponse<>
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<PaginatedApiResponse<>/Promise<PaginatedApiResponse<unknown>>/g' {} \;

# Fix Promise<ApiResponse<>
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<ApiResponse<>/Promise<ApiResponse<unknown>>/g' {} \;

# Fix standalone PaginatedApiResponse<>
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/: PaginatedApiResponse<>/: PaginatedApiResponse<unknown>/g' {} \;

# Fix standalone ApiResponse<>
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/: ApiResponse<>/: ApiResponse<unknown>/g' {} \;

echo "✅ Done!"

cd ../..
echo "Checking error count..."
npm run build 2>&1 | grep "error TS" | wc -l
