#!/bin/bash

# List of files to fix
files=(
"apps/web/app/(protected)/settings/SettingsClient.tsx"
"apps/web/app/(protected)/pipeline/PipelineClient.tsx"
"apps/web/app/(protected)/projects/ProjectsClient.tsx"
"apps/web/app/(protected)/opendeck/ProjectPostingClient.tsx"
"apps/web/app/(protected)/opendeck/VendorProfileClient.tsx"
"apps/web/app/(protected)/opendeck/ProposalSystem.tsx"
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
"apps/web/app/(protected)/finance/invoices/CreateInvoiceClient.tsx"
"apps/web/app/(protected)/finance/invoices/InvoicesClient.tsx"
"apps/web/app/(protected)/finance/expenses/CreateExpenseClient.tsx"
"apps/web/app/(protected)/finance/expenses/ExpensesClient.tsx"
"apps/web/app/(protected)/finance/transactions/TransactionsClient.tsx"
"apps/web/app/(protected)/finance/transactions/CreateTransactionClient.tsx"
"apps/web/app/(protected)/finance/accounts/AccountsClient.tsx"
"apps/web/app/(protected)/finance/accounts/CreateAccountClient.tsx"
"apps/web/app/(protected)/finance/budgets/BudgetsClient.tsx"
"apps/web/app/(protected)/finance/budgets/CreateBudgetClient.tsx"
"apps/web/app/(protected)/finance/forecasts/ForecastsClient.tsx"
"apps/web/app/(protected)/finance/forecasts/CreateForecastClient.tsx"
"apps/web/app/(protected)/finance/revenue/CreateRevenueClient.tsx"
"apps/web/app/(protected)/finance/revenue/RevenueClient.tsx"
"apps/web/app/(protected)/finance/FinanceClient.tsx"
"apps/web/app/(protected)/jobs/JobsClient.tsx"
"apps/web/app/(protected)/companies/contracts/ContractsClient.tsx"
"apps/web/app/(protected)/companies/directory/DirectoryClient.tsx"
"apps/web/app/(protected)/companies/CompaniesClient.tsx"
"apps/web/app/(protected)/analytics/AnalyticsClient.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        
        # Replace UniversalDrawer import with Drawer
        sed -i '' 's/UniversalDrawer,/Drawer,/g' "$file"
        sed -i '' 's/UniversalDrawer$/Drawer/g' "$file"
        
        # Replace UniversalDrawer component usage with Drawer
        sed -i '' 's/<UniversalDrawer/<Drawer/g' "$file"
        sed -i '' 's/<\/UniversalDrawer>/<\/Drawer>/g' "$file"
        
        # Replace isOpen prop with open
        sed -i '' 's/isOpen={/open={/g' "$file"
        
        # Replace size prop with width for Drawer components
        sed -i '' 's/size="lg"/width="lg"/g' "$file"
        sed -i '' 's/size="md"/width="md"/g' "$file"
        sed -i '' 's/size="sm"/width="sm"/g' "$file"
        sed -i '' 's/size="xl"/width="xl"/g' "$file"
        
        echo "Fixed $file"
    else
        echo "File not found: $file"
    fi
done

echo "All files processed!"
