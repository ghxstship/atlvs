import { Result } from '../../shared/Result';
import {
  AutomationRule,
  AutomationRuleCreate,
  AutomationRuleUpdate,
  AutomationRuleFilter,
  AutomationRuleExecution
} from '../entities/AutomationRule';

export interface AutomationRuleRepository {
  findById(id: string): Promise<Result<AutomationRule>>;
  findAll(filter?: AutomationRuleFilter): Promise<Result<AutomationRule[]>>;
  create(data: AutomationRuleCreate): Promise<Result<AutomationRule>>;
  update(id: string, data: AutomationRuleUpdate): Promise<Result<AutomationRule>>;
  delete(id: string): Promise<Result<void>>;
  activate(id: string): Promise<Result<void>>;
  deactivate(id: string): Promise<Result<void>>;
  incrementRunCount(id: string): Promise<Result<void>>;
  updateLastRun(id: string, timestamp: Date): Promise<Result<void>>;
  getExecutions(ruleId: string, limit?: number): Promise<Result<AutomationRuleExecution[]>>;
  createExecution(execution: Omit<AutomationRuleExecution, 'id' | 'executedAt'>): Promise<Result<AutomationRuleExecution>>;
  testRule(id: string, testData?: any): Promise<Result<{ success: boolean; result?: any; error?: string }>>;
  getActiveRulesByTrigger(organizationId: string, triggerType: string): Promise<Result<AutomationRule[]>>;
}
