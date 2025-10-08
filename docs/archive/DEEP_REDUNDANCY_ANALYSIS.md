# DEEP REDUNDANCY ANALYSIS REPORT
Generated: Wed Oct  8 10:37:20 EDT 2025

## 1. FILES MODULE vs PROGRAMMING MODULE OVERLAP

The /files/ module appears to duplicate functionality from /programming/ module:

### Duplicate: call-sheets
**Files module:** /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/files/call-sheets
**Programming module:** /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/programming/call-sheets

Files in /files/call-sheets/:
CallSheetsClient.tsx
CreateCallSheetClient.tsx
page.tsx
ProgrammingCallSheetsClient.tsx
types.ts

Files in /programming/call-sheets/:
CallSheetsClient.tsx
CreateCallSheetClient.tsx
page.tsx
ProgrammingCallSheetsClient.tsx
types.ts

### Duplicate: riders
**Files module:** /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/files/riders
**Programming module:** /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/programming/riders

Files in /files/riders/:
CreateRiderClient.tsx
page.tsx
ProgrammingRidersClient.tsx
RidersClient.tsx
types.ts

Files in /programming/riders/:
CreateRiderClient.tsx
page.tsx
ProgrammingRidersClient.tsx
RidersClient.tsx
types.ts


## 2. MARKETPLACE vs OPENDECK OVERLAP

- Found in marketplace: ProjectPostingClient.tsx
  Also exists in opendeck: ProjectPostingClient.tsx
- Found in marketplace: ProposalSystem.tsx
  Also exists in opendeck: ProposalSystem.tsx
- Found in marketplace: MarketplaceVendorClient.tsx

## 3. DUPLICATE SERVICE IMPLEMENTATIONS

Checking for service files with similar patterns...

- /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/marketplace/contracts/lib/contracts-service.ts
- /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/files/contracts/lib/contracts-service.ts
- /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)/companies/contracts/lib/contracts-service.ts

## 4. PROFILE MODULE DUPLICATES

Multiple Profile client implementations found:
- Mobile:      234 lines
- Mobile:      364 lines
- Mobile:      207 lines
- Mobile:      307 lines

## 5. PEOPLE MODULE DUPLICATES

Multiple People client implementations:
- Library/Mobile:      210 lines
- Library/Mobile:       24 lines
- Library/Mobile:      659 lines

## 6. DUPLICATE UTILITY FILES

### Files matching: monitoring.ts
- apps/web/lib/supabase/monitoring.ts
- apps/web/lib/monitoring.ts

### Files matching: i18n.ts
- apps/web/i18n.ts
- apps/web/lib/i18n.ts

### Files matching: middleware.ts
- apps/web/middleware.ts
- apps/web/lib/validations/validation/middleware.ts

### Files matching: validations.ts
- apps/web/app/(app)/(shell)/projects/lib/validations.ts
- apps/web/app/(app)/(shell)/marketplace/lib/validations.ts
- apps/web/app/(app)/(shell)/dashboard/lib/validations.ts
- apps/web/app/(app)/(shell)/profile/lib/validations.ts
- apps/web/app/(app)/(shell)/programming/lib/validations.ts
- apps/web/app/(app)/(shell)/procurement/lib/validations.ts
- apps/web/app/(app)/(shell)/people/lib/validations.ts
- apps/web/app/(app)/(shell)/files/lib/validations.ts
- apps/web/app/(app)/(shell)/finance/lib/validations.ts
- apps/web/app/(app)/(shell)/jobs/lib/validations.ts
- apps/web/app/(app)/(shell)/assets/lib/validations.ts
- apps/web/app/(app)/(shell)/companies/lib/validations.ts
- apps/web/app/(app)/(shell)/analytics/lib/validations.ts
- apps/web/lib/validations.ts

### Files matching: feature-flags.ts
- apps/web/app/lib/feature-flags.ts
- apps/web/lib/feature-flags.ts


## 7. PROGRAMMING MODULE INTERNAL DUPLICATES

### call-sheets has multiple clients:
CallSheetsClient.tsx
ProgrammingCallSheetsClient.tsx
CreateCallSheetClient.tsx

### events has multiple clients:
ProgrammingEventsClient.tsx
EventsClient.tsx
CreateEventClient.tsx

### itineraries has multiple clients:
CreateItineraryClient.tsx
ItinerariesClient.tsx
ProgrammingItinerariesClient.tsx

### lineups has multiple clients:
ProgrammingLineupsClient.tsx
LineupsClient.tsx
CreateLineupClient.tsx

### performances has multiple clients:
CreatePerformanceClient.tsx
PerformancesClient.tsx
ProgrammingPerformancesClient.tsx

### riders has multiple clients:
CreateRiderClient.tsx
RidersClient.tsx
ProgrammingRidersClient.tsx

### spaces has multiple clients:
ProgrammingSpacesClient.tsx
SpacesClient.tsx
CreateSpaceClient.tsx

### workshops has multiple clients:
ProgrammingWorkshopsClient.tsx
WorkshopsClient.tsx
CreateWorkshopClient.tsx


## 8. FINANCE MODULE DUPLICATES

### forecasts has multiple create clients:
- CreateForecastClient.tsx
- create/CreateForecastClient.tsx

### invoices has multiple create clients:
- CreateInvoiceClient.tsx
- create/CreateInvoiceClient.tsx

### revenue has multiple create clients:
- CreateRevenueClient.tsx
- create/CreateRevenueClient.tsx

### transactions has multiple create clients:
- create/CreateTransactionClient.tsx
- CreateTransactionClient.tsx


## 9. JOBS MODULE DUPLICATES

Multiple Jobs client implementations:
- app/(app)/(shell)/jobs/JobsClient.tsx:      277 lines
- app/(app)/(shell)/jobs/overview/JobsClient.tsx:      247 lines
- app/(app)/(shell)/jobs/overview/OverviewClient.tsx:      391 lines

## 10. CHROMELESS LAYOUT DUPLICATES

Files in (chromeless) layout that might duplicate (shell):
- Library/Mobile
- Library/Mobile
- Library/Mobile
- Library/Mobile
- Library/Mobile
- Library/Mobile
- Library/Mobile

---
✅ Deep redundancy analysis complete!
📄 Report saved to: /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/DEEP_REDUNDANCY_ANALYSIS.md
