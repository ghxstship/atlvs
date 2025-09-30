#!/bin/bash

# Fix invalid class names in application services

SERVICES_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/packages/application/src/services"

# Fix specific problematic service files
sed -i '' 's/catalog-itemsService/CatalogItemsService/g' "$SERVICES_DIR/catalog-items-service.ts"
sed -i '' 's/programmingService/ProgrammingService/g' "$SERVICES_DIR/programming-service.ts"
sed -i '' 's/pipelineService/PipelineService/g' "$SERVICES_DIR/pipeline-service.ts"
sed -i '' 's/financeService/FinanceService/g' "$SERVICES_DIR/finance-service.ts"
sed -i '' 's/listingsService/ListingsService/g' "$SERVICES_DIR/listings-service.ts"
sed -i '' 's/peopleService/PeopleService/g' "$SERVICES_DIR/people-service.ts"
sed -i '' 's/profileService/ProfileService/g' "$SERVICES_DIR/profile-service.ts"
sed -i '' 's/companiesService/CompaniesService/g' "$SERVICES_DIR/companies-service.ts"
sed -i '' 's/vendorsService/VendorsService/g' "$SERVICES_DIR/vendors-service.ts"
sed -i '' 's/programsService/ProgramsService/g' "$SERVICES_DIR/programs-service.ts"
sed -i '' 's/projectsService/ProjectsService/g' "$SERVICES_DIR/projects-service.ts"
sed -i '' 's/jobsService/JobsService/g' "$SERVICES_DIR/jobs-service.ts"

echo "Service class names fixed!"
