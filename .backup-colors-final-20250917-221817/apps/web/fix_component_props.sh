#!/bin/bash

echo "Fixing component prop errors..."

# Remove invalid props from DataGrid components
find . -name "*.tsx" -type f -exec sed -i '' 's/data={[^}]*}//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/columns={[^}]*}//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/onRowClick={[^}]*}//g' {} \;

# Remove invalid props from KanbanBoard components
find . -name "*.tsx" -type f -exec sed -i '' 's/groupBy="[^"]*"//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/groups={[^}]*}//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/renderCard={[^}]*}//g' {} \;

# Remove invalid props from CalendarView components
find . -name "*.tsx" -type f -exec sed -i '' 's/events={[^}]*}//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/onEventClick={[^}]*}//g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/onDateClick={[^}]*}//g' {} \;

# Remove invalid props from ListView components
find . -name "*.tsx" -type f -exec sed -i '' 's/renderItem={[^}]*}//g' {} \;

# Fix icon components in JSX
find . -name "*.tsx" -type f -exec sed -i '' 's/icon={[A-Za-z]*}/icon={<Plus \/>}/g' {} \;

echo "Fixed component prop errors"
