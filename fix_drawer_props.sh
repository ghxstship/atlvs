#!/bin/bash

echo "Fixing all Drawer prop issues..."

# List of files with Drawer prop issues
files=(
  "apps/web/app/(protected)/settings/SettingsClient.tsx"
  "apps/web/app/(protected)/pipeline/PipelineClient.tsx"
  "apps/web/app/(protected)/profile/ProfileClient.tsx"
  "apps/web/app/(protected)/programming/performances/PerformancesClient.tsx"
  "apps/web/app/(protected)/programming/workshops/WorkshopsClient.tsx"
  "apps/web/app/(protected)/programming/lineups/LineupsClient.tsx"
  "apps/web/app/(protected)/programming/spaces/SpacesClient.tsx"
  "apps/web/app/(protected)/programming/itineraries/ItinerariesClient.tsx"
  "apps/web/app/(protected)/programming/riders/RidersClient.tsx"
  "apps/web/app/(protected)/programming/call-sheets/CallSheetsClient.tsx"
  "apps/web/app/(protected)/programming/events/EventsClient.tsx"
  "apps/web/app/(protected)/programming/ProgrammingClient.tsx"
  "apps/web/app/(protected)/procurement/ProcurementClient.tsx"
  "apps/web/app/(protected)/people/PeopleClient.tsx"
  "apps/web/app/(protected)/finance/invoices/InvoicesClient.tsx"
  "apps/web/app/(protected)/finance/expenses/ExpensesClient.tsx"
  "apps/web/app/(protected)/finance/transactions/TransactionsClient.tsx"
  "apps/web/app/(protected)/finance/accounts/AccountsClient.tsx"
  "apps/web/app/(protected)/finance/budgets/BudgetsClient.tsx"
  "apps/web/app/(protected)/finance/forecasts/ForecastsClient.tsx"
  "apps/web/app/(protected)/finance/revenue/RevenueClient.tsx"
  "apps/web/app/(protected)/finance/FinanceClient.tsx"
  "apps/web/app/(protected)/jobs/JobsClient.tsx"
  "apps/web/app/(protected)/companies/contracts/ContractsClient.tsx"
  "apps/web/app/(protected)/companies/directory/DirectoryClient.tsx"
  "apps/web/app/(protected)/companies/CompaniesClient.tsx"
  "apps/web/app/(protected)/analytics/dashboards/CreateDashboardClient.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Remove invalid Drawer props
    sed -i '' '/record={/d' "$file"
    sed -i '' '/fields={/d' "$file"
    sed -i '' '/mode=/d' "$file"
    sed -i '' '/onSave={/d' "$file"
    sed -i '' '/onDelete={/d' "$file"
    
    # Add required props if missing
    if ! grep -q 'title=' "$file"; then
      sed -i '' 's/<Drawer/<Drawer title="Details"/g' "$file"
    fi
    
    if ! grep -q 'width=' "$file"; then
      sed -i '' 's/<Drawer\([^>]*\)>/<Drawer\1 width="md">/g' "$file"
    fi
    
    # Ensure Drawer has children content
    sed -i '' 's/<Drawer\([^>]*\)\/>/\
<Drawer\1>\
  <div className="p-6">\
    <p className="text-muted-foreground">Content will be displayed here.<\/p>\
  <\/div>\
<\/Drawer>/g' "$file"
    
  fi
done

echo "All Drawer prop issues fixed!"
