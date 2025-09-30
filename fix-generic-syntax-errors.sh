#!/bin/bash

# Fix all remaining generic type syntax errors in GHXSTSHIP production build
cd "apps/web"

echo "🔧 Fixing all generic type syntax errors..."

# Fix 1: Promise<ApiResponse<T> { → Promise<ApiResponse<T>> {
echo "Fixing Promise<ApiResponse<T> { syntax..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<ApiResponse<T> {/Promise<ApiResponse<T>> {/g' {} \;

# Fix 2: Promise<ApiResponse<T> { with newline
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/): Promise<ApiResponse<T> {/): Promise<ApiResponse<T>> {/g' {} \;

# Fix 3: Array<...> missing closing >
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Array<(error: ApiError) => ApiError | Promise<ApiError>/Array<(error: ApiError) => ApiError | Promise<ApiError>>/g' {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Array<(error: IApiError) => IApiError | Promise<IApiError>/Array<(error: IApiError) => IApiError | Promise<IApiError>>/g' {} \;

# Fix 4: React.ComponentType< missing closing >
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/React\.ComponentType<;/React.ComponentType<any>;/g' {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/ComponentType<;/ComponentType<any>;/g' {} \;

# Fix 5: Record<string, React.ComponentType<any> = {
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Record<string, React\.ComponentType<any> = {/Record<string, React.ComponentType<any>> = {/g' {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Record<string, ComponentType<any> = {/Record<string, ComponentType<any>> = {/g' {} \;

# Fix 6: RealtimePostgresChangesPayload<> incomplete
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/RealtimePostgresChangesPayload<)/RealtimePostgresChangesPayload<Record<string, unknown>>/g' {} \;

# Fix 7: PostgrestResponse<> incomplete
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/PostgrestResponse<)/PostgrestResponse<unknown>/g' {} \;

echo "✅ All generic type syntax errors fixed!"

# Run TypeScript check
echo ""
echo "Running TypeScript check..."
cd ../..
npx tsc --noEmit 2>&1 | head -50
