# DEEP CLEANUP EXECUTION LOG
Date: Wed Oct  8 10:39:16 EDT 2025

✅ Created backup directory: /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/.deep-cleanup-backup-20251008-103916

## PHASE 1: FILES/PROGRAMMING MODULE OVERLAP

⚠️ CRITICAL: Removing duplicate call-sheets and riders from /files/ module
These are exact duplicates of /programming/ versions

- Removed: /files/call-sheets/ (duplicates /programming/call-sheets/)
- Removed: /files/riders/ (duplicates /programming/riders/)
- Removed: /files/contracts/ (functionality exists in companies/contracts and marketplace/contracts)

## PHASE 2: MARKETPLACE/OPENDECK OVERLAP

- Removed: /opendeck/ProjectPostingClient.tsx (duplicates /marketplace/ProjectPostingClient.tsx)
- Removed: /opendeck/ProposalSystem.tsx (duplicates /marketplace/ProposalSystem.tsx)

## PHASE 3: DUPLICATE UTILITY FILES

- Removed duplicate utility: apps/web/app/lib/feature-flags.ts
- Removed duplicate utility: apps/web/i18n.ts

## PHASE 4: FINANCE MODULE CREATE CLIENT DUPLICATES

- Removed: /finance/forecasts/create/CreateForecastClient.tsx (duplicates root level version)
- Removed: /finance/invoices/create/CreateInvoiceClient.tsx (duplicates root level version)
- Removed: /finance/revenue/create/CreateRevenueClient.tsx (duplicates root level version)
- Removed: /finance/transactions/create/CreateTransactionClient.tsx (duplicates root level version)

## PHASE 5: PROGRAMMING MODULE INTERNAL DUPLICATES


## PHASE 6: JOBS MODULE DUPLICATES

- Removed: /jobs/overview/JobsClient.tsx (keeping OverviewClient.tsx)

## PHASE 7: PEOPLE MODULE DUPLICATES

- Removed: /people/overview/PeopleClient.tsx (keeping OverviewClient.tsx)

## PHASE 8: PROFILE MODULE DUPLICATES

- Removed: /profile/ProfileOptimizedClient.tsx (keeping ProfileClient.tsx)
- Removed: /profile/overview/ProfileOverviewClient.tsx (keeping ProfileClient.tsx)

## PHASE 9: PROGRAMMING MODULE ROOT DUPLICATES

- Removed: /programming/overview/ProgrammingClient.tsx (keeping root ProgrammingClient.tsx)

## CLEANUP SUMMARY

- Backup location: /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/.deep-cleanup-backup-20251008-103916
- Total items backed up:       13

✅ Deep cleanup complete!
📁 Backup created at: /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/.deep-cleanup-backup-20251008-103916
📄 Log file: /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/DEEP_CLEANUP_LOG.md
