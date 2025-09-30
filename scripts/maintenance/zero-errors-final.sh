#!/bin/bash

# Zero Errors Final Script
# Resolves ALL remaining TypeScript errors to achieve 100% error-free build

set -e

echo "🎯 Starting zero errors final resolution..."

cd "$(dirname "$0")/.."

# 1. Fix domain package exports - add all missing entities
echo "📦 Fixing domain package exports..."

cat > packages/domain/src/index.ts << 'EOF'
// Core Types
export * from './types/TenantContext';
export * from './types/Result';
export * from './types/DomainEvent';

// Entities
export * from './entities/User';
export * from './entities/Organization';
export * from './entities/Project';
export * from './entities/Company';
export * from './entities/CompanyContact';
export * from './entities/CompanyContract';
export * from './entities/CompanyQualification';
export * from './entities/CompanyRating';
export * from './entities/Product';
export * from './entities/Service';
export * from './entities/PurchaseOrder';
export * from './entities/Job';
export * from './entities/JobRole';
export * from './entities/CallSheet';
export * from './entities/Rider';
export * from './entities/Asset';
export * from './entities/CatalogItem';
export * from './entities/Budget';
export * from './entities/Expense';
export * from './entities/Revenue';
export * from './entities/Transaction';
export * from './entities/Account';
export * from './entities/Forecast';
export * from './entities/Invoice';
export * from './entities/UserProfile';
export * from './entities/Certification';
export * from './entities/JobHistory';

// Repositories
export * from './repositories/UserRepository';
export * from './repositories/OrganizationRepository';
export * from './repositories/ProjectRepository';
export * from './repositories/CompanyRepository';
export * from './repositories/CompanyContactRepository';
export * from './repositories/CompanyContractRepository';
export * from './repositories/CompanyQualificationRepository';
export * from './repositories/CompanyRatingRepository';
export * from './repositories/ProductRepository';
export * from './repositories/ServiceRepository';
export * from './repositories/PurchaseOrderRepository';
export * from './repositories/JobRepository';
export * from './repositories/JobRoleRepository';
export * from './repositories/CallSheetRepository';
export * from './repositories/RiderRepository';
export * from './repositories/AssetRepository';
export * from './repositories/CatalogItemRepository';
export * from './repositories/BudgetRepository';
export * from './repositories/ExpenseRepository';
export * from './repositories/RevenueRepository';
export * from './repositories/TransactionRepository';
export * from './repositories/AccountRepository';
export * from './repositories/ForecastRepository';
export * from './repositories/InvoiceRepository';
export * from './repositories/UserProfileRepository';
export * from './repositories/CertificationRepository';
export * from './repositories/JobHistoryRepository';

// Services
export * from './services/RBAC';
export * from './services/AuditLogger';
export * from './services/EventBus';
export * from './services/DomainService';

// Value Objects
export * from './value-objects/Money';
export * from './value-objects/Address';
export * from './value-objects/Email';
export * from './value-objects/PhoneNumber';
export * from './value-objects/DateRange';
EOF

# 2. Create missing domain entities
echo "🏗️ Creating missing domain entities..."

# Create TenantContext
mkdir -p packages/domain/src/types
cat > packages/domain/src/types/TenantContext.ts << 'EOF'
export interface TenantContext {
  organizationId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}
EOF

# Create Result type
cat > packages/domain/src/types/Result.ts << 'EOF'
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export const Ok = <T>(data: T): Result<T> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });
EOF

# Create DomainEvent
cat > packages/domain/src/types/DomainEvent.ts << 'EOF'
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  occurredAt: Date;
  data: Record<string, any>;
}
EOF

# Create missing entities
mkdir -p packages/domain/src/entities

# CatalogItem entity
cat > packages/domain/src/entities/CatalogItem.ts << 'EOF'
export interface CatalogItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  category: string;
  price: number;
  currency: string;
  sku?: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
EOF

# Company entities
cat > packages/domain/src/entities/Company.ts << 'EOF'
export interface Company {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: 'active' | 'inactive';
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  foundedYear?: number;
  logo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF

cat > packages/domain/src/entities/CompanyContact.ts << 'EOF'
export interface CompanyContact {
  id: string;
  companyId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF

cat > packages/domain/src/entities/CompanyContract.ts << 'EOF'
export interface CompanyContract {
  id: string;
  companyId: string;
  organizationId: string;
  title: string;
  type: 'MSA' | 'SOW' | 'NDA' | 'Service Agreement' | 'Purchase Agreement' | 'Other';
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'pending';
  value?: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  renewalTerms?: string;
  description?: string;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF

cat > packages/domain/src/entities/CompanyQualification.ts << 'EOF'
export interface CompanyQualification {
  id: string;
  companyId: string;
  organizationId: string;
  name: string;
  type: 'certification' | 'license' | 'insurance' | 'bond' | 'other';
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  verificationStatus: 'verified' | 'pending' | 'failed';
  documentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF

cat > packages/domain/src/entities/CompanyRating.ts << 'EOF'
export interface CompanyRating {
  id: string;
  companyId: string;
  organizationId: string;
  projectId?: string;
  rating: number;
  maxRating: number;
  category: 'overall' | 'quality' | 'timeliness' | 'communication' | 'value';
  review?: string;
  reviewerName?: string;
  isPublic: boolean;
  wouldRecommend: boolean;
  createdAt: Date;
  updatedAt: Date;
}
EOF

# Create missing repositories
mkdir -p packages/domain/src/repositories

cat > packages/domain/src/repositories/CatalogItemRepository.ts << 'EOF'
import { CatalogItem } from '../entities/CatalogItem';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CatalogItemRepository {
  findById(id: string, context: TenantContext): Promise<Result<CatalogItem | null>>;
  findAll(context: TenantContext): Promise<Result<CatalogItem[]>>;
  create(item: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<CatalogItem>>;
  update(id: string, updates: Partial<CatalogItem>, context: TenantContext): Promise<Result<CatalogItem>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

cat > packages/domain/src/repositories/CompanyRepository.ts << 'EOF'
import { Company } from '../entities/Company';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CompanyRepository {
  findById(id: string, context: TenantContext): Promise<Result<Company | null>>;
  findAll(context: TenantContext): Promise<Result<Company[]>>;
  create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<Company>>;
  update(id: string, updates: Partial<Company>, context: TenantContext): Promise<Result<Company>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

cat > packages/domain/src/repositories/CompanyContactRepository.ts << 'EOF'
import { CompanyContact } from '../entities/CompanyContact';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CompanyContactRepository {
  findById(id: string, context: TenantContext): Promise<Result<CompanyContact | null>>;
  findByCompanyId(companyId: string, context: TenantContext): Promise<Result<CompanyContact[]>>;
  create(contact: Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<CompanyContact>>;
  update(id: string, updates: Partial<CompanyContact>, context: TenantContext): Promise<Result<CompanyContact>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

cat > packages/domain/src/repositories/CompanyContractRepository.ts << 'EOF'
import { CompanyContract } from '../entities/CompanyContract';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CompanyContractRepository {
  findById(id: string, context: TenantContext): Promise<Result<CompanyContract | null>>;
  findByCompanyId(companyId: string, context: TenantContext): Promise<Result<CompanyContract[]>>;
  create(contract: Omit<CompanyContract, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<CompanyContract>>;
  update(id: string, updates: Partial<CompanyContract>, context: TenantContext): Promise<Result<CompanyContract>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

cat > packages/domain/src/repositories/CompanyQualificationRepository.ts << 'EOF'
import { CompanyQualification } from '../entities/CompanyQualification';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CompanyQualificationRepository {
  findById(id: string, context: TenantContext): Promise<Result<CompanyQualification | null>>;
  findByCompanyId(companyId: string, context: TenantContext): Promise<Result<CompanyQualification[]>>;
  create(qualification: Omit<CompanyQualification, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<CompanyQualification>>;
  update(id: string, updates: Partial<CompanyQualification>, context: TenantContext): Promise<Result<CompanyQualification>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

cat > packages/domain/src/repositories/CompanyRatingRepository.ts << 'EOF'
import { CompanyRating } from '../entities/CompanyRating';
import { TenantContext } from '../types/TenantContext';
import { Result } from '../types/Result';

export interface CompanyRatingRepository {
  findById(id: string, context: TenantContext): Promise<Result<CompanyRating | null>>;
  findByCompanyId(companyId: string, context: TenantContext): Promise<Result<CompanyRating[]>>;
  create(rating: Omit<CompanyRating, 'id' | 'createdAt' | 'updatedAt'>, context: TenantContext): Promise<Result<CompanyRating>>;
  update(id: string, updates: Partial<CompanyRating>, context: TenantContext): Promise<Result<CompanyRating>>;
  delete(id: string, context: TenantContext): Promise<Result<void>>;
}
EOF

# Create missing services
mkdir -p packages/domain/src/services

cat > packages/domain/src/services/RBAC.ts << 'EOF'
import { TenantContext } from '../types/TenantContext';

export interface RBAC {
  hasPermission(context: TenantContext, permission: string): boolean;
  hasRole(context: TenantContext, role: string): boolean;
  checkPermission(context: TenantContext, permission: string): void;
  checkRole(context: TenantContext, role: string): void;
}

export class RBACService implements RBAC {
  hasPermission(context: TenantContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  hasRole(context: TenantContext, role: string): boolean {
    return context.roles.includes(role);
  }

  checkPermission(context: TenantContext, permission: string): void {
    if (!this.hasPermission(context, permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  checkRole(context: TenantContext, role: string): void {
    if (!this.hasRole(context, role)) {
      throw new Error(`Role required: ${role}`);
    }
  }
}
EOF

cat > packages/domain/src/services/AuditLogger.ts << 'EOF'
import { TenantContext } from '../types/TenantContext';

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AuditLogger {
  log(context: TenantContext, action: string, resource: string, resourceId: string, metadata?: Record<string, any>): Promise<void>;
  query(context: TenantContext, filters?: Partial<AuditLogEntry>): Promise<AuditLogEntry[]>;
}

export class AuditLoggerService implements AuditLogger {
  async log(context: TenantContext, action: string, resource: string, resourceId: string, metadata?: Record<string, any>): Promise<void> {
    // Implementation would log to database
    console.log(`Audit: ${context.userId} performed ${action} on ${resource}:${resourceId}`);
  }

  async query(context: TenantContext, filters?: Partial<AuditLogEntry>): Promise<AuditLogEntry[]> {
    // Implementation would query database
    return [];
  }
}
EOF

cat > packages/domain/src/services/EventBus.ts << 'EOF'
import { DomainEvent } from '../types/DomainEvent';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export class EventBusService implements EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}
EOF

# 3. Fix UI component prop issues
echo "🔧 Fixing UI component props..."

# Fix Toggle component to match FormView usage
cat > packages/ui/src/components/Toggle.tsx << 'EOF'
'use client';

import React from 'react';

export interface ToggleProps {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  className?: string;
}

export function Toggle({
  enabled,
  disabled = false,
  onChange,
  label,
  className = ''
}: ToggleProps) {
  return (
    <label className={`flex items-center gap-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && onChange(!enabled)}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </div>
      <span className="text-body text-foreground dark:text-white">
        {label}
      </span>
    </label>
  );
}
EOF

# 4. Fix DataViewProvider with complete context
echo "📊 Fixing DataViewProvider..."

cat > packages/ui/src/organisms/data-views/DataViewProvider.tsx << 'EOF'
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataViewContextType, ViewType, SortConfig, FilterConfig, GroupConfig, SavedView, ViewState, DataRecord, DataViewConfig } from './types';

const DataViewContext = createContext<DataViewContextType | null>(null);

interface DataViewProviderProps {
  children: ReactNode;
  initialData?: DataRecord[];
  initialConfig?: Partial<DataViewConfig>;
}

export function DataViewProvider({ 
  children, 
  initialData = [],
  initialConfig = {}
}: DataViewProviderProps) {
  const [viewType, setViewType] = useState<ViewType>(initialConfig.viewType || 'grid');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>(initialConfig.filters || []);
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialConfig.search || '');
  const [selectedView, setSelectedView] = useState<SavedView | null>(null);
  const [data] = useState<DataRecord[]>(initialData);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const viewState: ViewState = {
    viewType,
    filters: filterConfig,
    sorts: sortConfig ? [sortConfig] : [],
    groups: groupConfig ? [groupConfig] : [],
    search: searchQuery,
    pagination: {
      page: 1,
      pageSize: 20
    }
  };

  const config: DataViewConfig = {
    viewType,
    fields: initialConfig.fields || [],
    data,
    filters: filterConfig,
    sorts: sortConfig ? [sortConfig] : [],
    groups: groupConfig ? [groupConfig] : [],
    search: searchQuery,
    pagination: {
      page: 1,
      pageSize: 20
    }
  };

  const actions = {
    onRecordClick: (record: DataRecord) => {
      console.log('Record clicked:', record);
    },
    onRecordSelect: (record: DataRecord) => {
      console.log('Record selected:', record);
    },
    onRecordEdit: (record: DataRecord) => {
      console.log('Record edit:', record);
    },
    onRecordDelete: (record: DataRecord) => {
      console.log('Record delete:', record);
    }
  };

  const contextValue: DataViewContextType = {
    viewType,
    setViewType,
    sortConfig,
    setSortConfig,
    filterConfig,
    setFilterConfig,
    groupConfig,
    setGroupConfig,
    searchQuery,
    setSearchQuery,
    selectedView,
    setSelectedView,
    viewState,
    setViewState: () => {},
    data,
    loading,
    error,
    config,
    actions
  };

  return (
    <DataViewContext.Provider value={contextValue}>
      {children}
    </DataViewContext.Provider>
  );
}

export function useDataView(): DataViewContextType {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error('useDataView must be used within a DataViewProvider');
  }
  return context;
}
EOF

# 5. Run build and check for zero errors
echo "🏗️ Running final build check..."
ERROR_COUNT=$(pnpm build 2>&1 | grep -E "(error|Error)" | wc -l | tr -d ' ')

echo "📊 Final TypeScript error count: $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "🎉 SUCCESS: Zero TypeScript errors achieved!"
    echo "✅ 100% error-free build validated"
else
    echo "⚠️  Still have $ERROR_COUNT errors remaining"
    echo "📋 Remaining errors:"
    pnpm build 2>&1 | grep -E "(error|Error)" | head -10
fi

echo "✅ Zero errors final script completed"
EOF

chmod +x /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/scripts/zero-errors-final.sh
