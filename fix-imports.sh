#!/bin/bash

# Script to fix UI component imports in GHXSTSHIP

find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  -e 's|@ghxstship/ui/components/ui/button|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/card|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/input|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/label|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/textarea|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/select|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/separator|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/tabs|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/toggle|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/modal|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/table|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/badge|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/alert|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/avatar|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/breadcrumbs|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/loader|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/switch|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/tooltip|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/dropdown|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/dropdown-menu|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/sheet|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/drawer|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/export-button|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/form|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/checkbox|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/link|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/search-box|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/pagination|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/sidebar|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/skeleton|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/toast|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/progress|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/image|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/date-picker|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/file-upload|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/tag-input|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/empty-state|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/sidebar-landmarks|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/app-drawer|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/icon|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/list-with-keys|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/heading|@ghxstship/ui|g' \
  -e 's|@ghxstship/ui/components/ui/search-filter|@ghxstship/ui|g' \
  {} \;

echo "Import fixes completed"
