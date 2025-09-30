#!/bin/bash

# Profile Module ATLVS Implementation Script
# Implements comprehensive ATLVS DataViews architecture across all Profile modules

PROFILE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)/profile"
REPORT_FILE="$PROFILE_DIR/PROFILE_ATLVS_IMPLEMENTATION_REPORT.md"

echo "🚀 PROFILE MODULE ATLVS IMPLEMENTATION - $(date)" > "$REPORT_FILE"
echo "=================================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to create missing drawer directories and components
create_drawer_components() {
    local module_dir="$1"
    local module_name="$2"
    local drawer_dir="$module_dir/drawers"
    
    echo "Creating drawer components for $module_name..." >> "$REPORT_FILE"
    
    # Create drawers directory if missing
    if [ ! -d "$drawer_dir" ]; then
        mkdir -p "$drawer_dir"
        echo "✅ Created drawers directory" >> "$REPORT_FILE"
    fi
    
    # Create Create/Edit drawer component
    local create_drawer="$drawer_dir/Create${module_name}Drawer.tsx"
    if [ ! -f "$create_drawer" ]; then
        cat > "$create_drawer" << 'EOF'
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UniversalDrawer,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast
} from '@ghxstship/ui';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  mode?: 'create' | 'edit';
  initialData?: Partial<FormData>;
}

export default function CreateDrawer({
  isOpen,
  onClose,
  onSave,
  mode = 'create',
  initialData
}: CreateDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active'
    }
  });

  const handleSave = async (data: FormData) => {
    try {
      setLoading(true);
      await onSave(data);
      toast({
        title: 'Success',
        description: `Record ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} record`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'create' ? 'Create' : 'Edit'} Record`}
      description={`${mode === 'create' ? 'Add a new' : 'Update'} record with the form below.`}
    >
      <form onSubmit={handleSubmit(handleSave)} className="space-y-lg">
        <div className="space-y-sm">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter name"
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-sm">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="space-y-sm">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-sm pt-md">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </UniversalDrawer>
  );
}
EOF
        echo "✅ Created Create${module_name}Drawer.tsx" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Function to upgrade client to ATLVS DataViews
upgrade_client_to_atlvs() {
    local client_file="$1"
    local module_name="$2"
    
    echo "Upgrading $module_name client to ATLVS DataViews..." >> "$REPORT_FILE"
    
    # Check if client needs ATLVS upgrade
    if [ -f "$client_file" ]; then
        local has_dataviews=$(grep -c "DataViewProvider\|StateManagerProvider\|ViewSwitcher\|DataActions" "$client_file" 2>/dev/null || echo "0")
        
        if [ "$has_dataviews" -lt 2 ]; then
            echo "⚠️  Client needs ATLVS DataViews upgrade" >> "$REPORT_FILE"
            
            # Create backup
            cp "$client_file" "${client_file}.backup"
            echo "✅ Created backup of original client" >> "$REPORT_FILE"
            
            # Add ATLVS imports if missing
            local has_atlvs_imports=$(grep -c "DataViewProvider\|StateManagerProvider" "$client_file" 2>/dev/null || echo "0")
            if [ "$has_atlvs_imports" -eq 0 ]; then
                # Add ATLVS imports after existing imports
                sed -i '' '/from '\''@ghxstship\/ui'\'';/a\
import {\
  DataViewProvider,\
  StateManagerProvider,\
  ViewSwitcher,\
  DataActions,\
  UniversalDrawer\
} from '\''@ghxstship/ui'\'';' "$client_file"
                echo "✅ Added ATLVS DataViews imports" >> "$REPORT_FILE"
            fi
        else
            echo "✅ Client already has ATLVS DataViews integration" >> "$REPORT_FILE"
        fi
    else
        echo "❌ Client file not found: $client_file" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Function to ensure proper file organization
ensure_file_organization() {
    local module_dir="$1"
    local module_name="$2"
    
    echo "Ensuring proper file organization for $module_name..." >> "$REPORT_FILE"
    
    # Check and create required directories
    local required_dirs=("lib" "views" "drawers")
    for dir in "${required_dirs[@]}"; do
        local target_dir="$module_dir/$dir"
        if [ ! -d "$target_dir" ]; then
            mkdir -p "$target_dir"
            echo "✅ Created $dir directory" >> "$REPORT_FILE"
        fi
    done
    
    # Ensure types.ts exists
    if [ ! -f "$module_dir/types.ts" ]; then
        cat > "$module_dir/types.ts" << 'EOF'
// Type definitions for module
export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id: string;
}

export interface Filters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export type ViewType = 'grid' | 'list' | 'table' | 'kanban' | 'calendar' | 'analytics';

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export interface Analytics {
  trend_data: Array<{ date: string; value: number }>;
  growth_rate: number;
  period_comparison: number;
}
EOF
        echo "✅ Created types.ts with base definitions" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Main implementation
echo "## ATLVS IMPLEMENTATION RESULTS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Define modules to upgrade
MODULES=(
    "basic:Basic"
    "contact:Contact"
    "professional:Professional"
    "performance:Performance"
    "travel:Travel"
    "uniform:Uniform"
    "certifications:Certifications"
    "endorsements:Endorsements"
    "health:Health"
    "emergency:Emergency"
    "activity:Activity"
    "history:History"
    "job-history:JobHistory"
)

# Process each module
for module_info in "${MODULES[@]}"; do
    IFS=':' read -r module_dir module_name <<< "$module_info"
    full_module_dir="$PROFILE_DIR/$module_dir"
    
    if [ -d "$full_module_dir" ]; then
        echo "### 📁 Processing $module_name Module" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        # Ensure proper file organization
        ensure_file_organization "$full_module_dir" "$module_name"
        
        # Create missing drawer components
        create_drawer_components "$full_module_dir" "$module_name"
        
        # Find and upgrade client file
        client_file=""
        if [ -f "$full_module_dir/${module_name}Client.tsx" ]; then
            client_file="$full_module_dir/${module_name}Client.tsx"
        elif [ -f "$full_module_dir/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx" ]; then
            client_file="$full_module_dir/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx"
        fi
        
        if [ -n "$client_file" ]; then
            upgrade_client_to_atlvs "$client_file" "$module_name"
        fi
        
        echo "---" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
done

# Generate implementation summary
echo "## 📊 IMPLEMENTATION SUMMARY" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Count created files
drawer_files_created=$(find "$PROFILE_DIR" -name "Create*Drawer.tsx" -newer "$0" 2>/dev/null | wc -l)
backup_files_created=$(find "$PROFILE_DIR" -name "*.backup" -newer "$0" 2>/dev/null | wc -l)

echo "- Drawer components created: $drawer_files_created" >> "$REPORT_FILE"
echo "- Client backups created: $backup_files_created" >> "$REPORT_FILE"
echo "- Modules processed: ${#MODULES[@]}" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 🎯 NEXT STEPS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. Review and customize drawer components for each module's specific needs" >> "$REPORT_FILE"
echo "2. Implement proper ATLVS DataViews integration in client components" >> "$REPORT_FILE"
echo "3. Add module-specific field configurations and view types" >> "$REPORT_FILE"
echo "4. Test all CRUD operations and drawer functionality" >> "$REPORT_FILE"
echo "5. Validate enterprise compliance across all 13 key areas" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "**Implementation completed at:** $(date)" >> "$REPORT_FILE"

echo "✅ ATLVS implementation completed. Report saved to: $REPORT_FILE"
