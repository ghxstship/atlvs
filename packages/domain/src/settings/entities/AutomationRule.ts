export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: Record<string, any>;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
  }>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
    order: number;
  }>;
  isActive: boolean;
  runCount: number;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface AutomationRuleCreate {
  organizationId: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: Record<string, any>;
  conditions?: AutomationRule['conditions'];
  actions: AutomationRule['actions'];
  isActive?: boolean;
  createdBy?: string;
}

export interface AutomationRuleUpdate {
  name?: string;
  description?: string;
  triggerType?: string;
  triggerConfig?: Record<string, any>;
  conditions?: AutomationRule['conditions'];
  actions?: AutomationRule['actions'];
  isActive?: boolean;
}

export interface AutomationRuleFilter {
  organizationId?: string;
  triggerType?: string;
  isActive?: boolean;
  search?: string;
}

export interface AutomationRuleExecution {
  id: string;
  ruleId: string;
  trigger: Record<string, any>;
  conditionsResult: boolean;
  actionsExecuted: Array<{
    action: string;
    result: 'success' | 'failed';
    error?: string;
  }>;
  status: 'success' | 'partial' | 'failed';
  executedAt: Date;
}
