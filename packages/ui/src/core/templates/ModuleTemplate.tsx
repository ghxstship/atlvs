'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { Button } from '../../unified/Button';
import { UnifiedDrawer } from '../../unified/drawers/UnifiedDrawer';
import { UnifiedService } from '../../unified/services/UnifiedService';
import { ATLVSProvider } from '../providers/ATLVSProvider';
import { OverviewTemplate } from './OverviewTemplate';
import { 
  ViewSwitcher, 
  DataViewContainer, 
  DataActions 
} from '../../components/DataViews';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import type { 
  ModuleConfig, 
  ModuleTab, 
  ModuleEntity,
  User 
} from '../../config/types';

export interface ModuleTemplateProps {
  config: ModuleConfig;
  user: User;
  orgId: string;
  translations?: Record<string, string>;
}

export const ModuleTemplate: React.FC<ModuleTemplateProps> = ({ 
  config, 
  user, 
  orgId,
  translations = {}
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(config.defaultTab || 'overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view' | 'bulk';
    entity?: string;
    data?: any;
  }>({ open: false, mode: 'create' });

  // Initialize services for each entity
  const services = useMemo(() => {
    const serviceMap: Record<string, UnifiedService<any>> = {};
    
    Object.entries(config.entities).forEach(([key, entity]) => {
      serviceMap[key] = new UnifiedService({
        table: entity.table,
        schema: entity.schema,
        includes: entity.includes || [],
        searchFields: entity.searchFields || [],
        orderBy: entity.orderBy || 'created_at.desc',
        filters: { organization_id: orgId }, // Add org context
        transforms: entity.transforms || {},
        cache: entity.cache || { enabled: false },
      });
    });
    
    return serviceMap;
  }, [config.entities, orgId]);

  // Handle CRUD operations
  const handleCreate = (entityKey: string) => {
    setDrawerState({
      open: true,
      mode: 'create',
      entity: entityKey,
      data: config.entities[entityKey].defaultValues || {},
    });
  };

  const handleEdit = (entityKey: string, data: any) => {
    setDrawerState({
      open: true,
      mode: 'edit',
      entity: entityKey,
      data,
    });
  };

  const handleView = (entityKey: string, data: any) => {
    setDrawerState({
      open: true,
      mode: 'view',
      entity: entityKey,
      data,
    });
  };

  const handleDelete = async (entityKey: string, id: string) => {
    const entity = config.entities[entityKey];
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${entity.singular.toLowerCase()}?`
    );
    
    if (!confirmed) return;
    
    try {
      await services[entityKey].delete(id);
      toast({
        title: 'Success',
        description: `${entity.singular} deleted successfully`,
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (entityKey: string, action: string, ids: string[]) => {
    const entity = config.entities[entityKey];
    
    try {
      switch (action) {
        case 'delete':
          const confirmed = window.confirm(
            `Are you sure you want to delete ${ids.length} ${entity.plural.toLowerCase()}?`
          );
          if (!confirmed) return;
          
          await services[entityKey].bulkDelete(ids);
          toast({
            title: 'Success',
            description: `${ids.length} ${entity.plural.toLowerCase()} deleted successfully`,
          });
          break;
        
        case 'export':
          // Handle export logic
          console.log('Exporting', ids);
          break;
        
        default:
          // Handle custom bulk actions
          if (entity.bulkActions?.[action]) {
            await entity.bulkActions[action](ids);
          }
      }
      
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Bulk operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDrawerSuccess = (result: any) => {
    handleRefresh();
    
    // Handle post-success actions
    if (drawerState.mode === 'create' && config.onCreateSuccess) {
      config.onCreateSuccess(result);
    } else if (drawerState.mode === 'edit' && config.onUpdateSuccess) {
      config.onUpdateSuccess(result);
    }
  };

  // Render individual tab content
  const renderTab = (tab: ModuleTab) => {
    // Overview tab
    if (tab.type === 'overview') {
      return (
        <OverviewTemplate
          config={tab.config!}
          services={services}
          orgId={orgId}
          onCreate={handleCreate}
          onRefresh={handleRefresh}
        />
      );
    }

    // Entity-based tab
    if (tab.entity) {
      const entity = config.entities[tab.entity];
      if (!entity) {
        console.error(`Entity ${tab.entity} not found in config`);
        return null;
      }

      return (
        <ATLVSProvider
          key={refreshKey}
          config={{
            entity: tab.entity,
            service: services[tab.entity],
            fields: entity.fields,
            views: tab.views || entity.defaultViews || ['grid', 'list'],
            filters: entity.filters,
            actions: {
              create: entity.permissions?.create !== false 
                ? () => handleCreate(tab.entity!) 
                : undefined,
              edit: entity.permissions?.update !== false
                ? (data) => handleEdit(tab.entity!, data)
                : undefined,
              view: (data) => handleView(tab.entity!, data),
              delete: entity.permissions?.delete !== false
                ? (id) => handleDelete(tab.entity!, id)
                : undefined,
              bulk: (action, ids) => handleBulkAction(tab.entity!, action, ids),
            },
            customActions: entity.customActions,
            emptyState: entity.emptyState,
          }}
        >
          <div className="space-y-md">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {tab.label || entity.plural}
                </h2>
                {tab.description && (
                  <p className="text-muted-foreground mt-xs">
                    {tab.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-icon-xs w-icon-xs" />
                </Button>
                
                {entity.permissions?.create !== false && (
                  <Button onClick={() => handleCreate(tab.entity!)}>
                    <Plus className="mr-xs h-icon-xs w-icon-xs" />
                    {translations[`create_${tab.entity}`] || `Create ${entity.singular}`}
                  </Button>
                )}
                
                {entity.headerActions?.map(action => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size={action.size}
                    onClick={action.onClick}
                  >
                    {action.icon && <action.icon className="mr-xs h-icon-xs w-icon-xs" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Data Views */}
            <ViewSwitcher />
            <DataViewContainer />
            <DataActions />
          </div>
        </ATLVSProvider>
      );
    }

    // Custom tab
    if (tab.component) {
      const CustomComponent = tab.component;
      return (
        <CustomComponent
          user={user}
          orgId={orgId}
          services={services}
          onRefresh={handleRefresh}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-lg">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-sm">
            {config.icon && <config.icon className="h-icon-lg w-icon-lg" />}
            {config.name}
          </h1>
          {config.description && (
            <p className="text-muted-foreground mt-xs">
              {config.description}
            </p>
          )}
        </div>
        
        {config.headerActions && (
          <div className="flex gap-sm">
            {config.headerActions.map(action => (
              <Button
                key={action.id}
                variant={action.variant}
                size={action.size}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="mr-xs h-icon-xs w-icon-xs" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start">
          {config.tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              disabled={tab.disabled}
            >
              {tab.icon && <tab.icon className="mr-xs h-icon-xs w-icon-xs" />}
              {tab.label}
              {tab.badge && (
                <span className="ml-xs px-xs py-0 text-xs bg-primary/10 text-primary rounded">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {config.tabs.map(tab => (
          <TabsContent 
            key={tab.id} 
            value={tab.id}
            className="mt-md"
          >
            {renderTab(tab)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Unified Drawer */}
      {drawerState.open && drawerState.entity && (
        <UnifiedDrawer
          open={drawerState.open}
          onClose={() => setDrawerState({ ...drawerState, open: false })}
          config={{
            entity: config.entities[drawerState.entity].singular,
            mode: drawerState.mode,
            schema: config.entities[drawerState.entity].schema,
            service: services[drawerState.entity],
            fields: config.entities[drawerState.entity].fields,
            customActions: config.entities[drawerState.entity].drawerActions,
            layout: config.entities[drawerState.entity].drawerLayout,
            size: config.entities[drawerState.entity].drawerSize,
            submitLabel: config.entities[drawerState.entity].submitLabel,
            cancelLabel: config.entities[drawerState.entity].cancelLabel,
            deleteConfirmation: config.entities[drawerState.entity].deleteConfirmation !== false,
            autoSave: config.entities[drawerState.entity].autoSave,
            autoSaveDelay: config.entities[drawerState.entity].autoSaveDelay,
          }}
          data={drawerState.data}
          onSuccess={handleDrawerSuccess}
          onError={(error) => {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }}
        />
      )}
    </div>
  );
};

export default ModuleTemplate;
