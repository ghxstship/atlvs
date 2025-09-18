'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
// Avoid importing Supabase types to keep UI package dependency-free
// type SupabaseClient = any;
import { Button } from '../Button';
import { Badge } from '../Badge';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Save,
  Loader2
} from 'lucide-react';
import { DataRecord } from './types';

interface DatabaseTransactionManagerProps {
  supabase: any;
  tableName: string;
  onTransactionComplete?: (result: TransactionResult) => void;
  onTransactionError?: (error: TransactionError) => void;
  className?: string;
}

interface TransactionOperation {
  id: string;
  type: 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  data?: any;
  conditions?: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  error?: string;
  rollbackData?: any;
}

interface TransactionBatch {
  id: string;
  operations: TransactionOperation[];
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface TransactionResult {
  batchId: string;
  success: boolean;
  operations: TransactionOperation[];
  affectedRows: number;
  executionTime: number;
}

interface TransactionError {
  batchId: string;
  operation: TransactionOperation;
  error: string;
  rollbackAttempted: boolean;
  rollbackSuccess?: boolean;
}

export function DatabaseTransactionManager({
  supabase,
  tableName,
  onTransactionComplete,
  onTransactionError,
  className = ''
}: DatabaseTransactionManagerProps) {
  const [currentBatch, setCurrentBatch] = useState<TransactionBatch | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionBatch[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(new Map());
  const rollbackTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize new transaction batch
  const startTransaction = useCallback(() => {
    const newBatch: TransactionBatch = {
      id: `batch_${Date.now()}`,
      operations: [],
      status: 'pending'
    };
    setCurrentBatch(newBatch);
    return newBatch.id;
  }, []);

  // Add operation to current batch
  const addOperation = useCallback((
    type: TransactionOperation['type'],
    data?: any,
    conditions?: Record<string, any>
  ): string => {
    if (!currentBatch) {
      throw new Error('No active transaction batch. Call startTransaction() first.');
    }

    const operation: TransactionOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      table: tableName,
      data,
      conditions,
      timestamp: new Date(),
      status: 'pending'
    };

    setCurrentBatch(prev => prev ? {
      ...prev,
      operations: [...prev.operations, operation]
    } : null);

    // Apply optimistic update for immediate UI feedback
    if (type === 'insert' || type === 'upsert') {
      const optimisticId = data?.id || `temp_${operation.id}`;
      setOptimisticUpdates(prev => new Map(prev.set(optimisticId, { ...data, _optimistic: true })));
    } else if (type === 'update' && conditions?.id) {
      setOptimisticUpdates(prev => {
        const existing = prev.get(conditions.id) || {};
        return new Map(prev.set(conditions.id, { ...existing, ...data, _optimistic: true }));
      });
    } else if (type === 'delete' && conditions?.id) {
      setOptimisticUpdates(prev => new Map(prev.set(conditions.id, { _deleted: true, _optimistic: true })));
    }

    return operation.id;
  }, [currentBatch, tableName]);

  // Execute transaction batch with proper error handling and rollback
  const executeTransaction = useCallback(async (): Promise<TransactionResult> => {
    if (!currentBatch || currentBatch.operations.length === 0) {
      throw new Error('No operations to execute');
    }

    setIsExecuting(true);
    const startTime = Date.now();
    
    setCurrentBatch(prev => prev ? {
      ...prev,
      status: 'executing',
      startTime: new Date()
    } : null);

    try {
      const results: any[] = [];
      const rollbackOps: TransactionOperation[] = [];
      let affectedRows = 0;

      // Execute operations sequentially with rollback preparation
      for (const operation of currentBatch.operations) {
        try {
          setCurrentBatch(prev => prev ? {
            ...prev,
            operations: prev.operations.map(op => 
              op.id === operation.id ? { ...op, status: 'executing' } : op
            )
          } : null);

          let result;
          let rollbackData;

          switch (operation.type) {
            case 'insert':
              result = await supabase
                .from(operation.table)
                .insert(operation.data)
                .select()
                .single();
              
              if (result.error) throw result.error;
              
              // Prepare rollback operation
              rollbackOps.push({
                ...operation,
                id: `rollback_${operation.id}`,
                type: 'delete',
                conditions: { id: result.data.id },
                rollbackData: result.data
              });
              break;

            case 'update':
              // Get current data for rollback
              const { data: currentData } = await supabase
                .from(operation.table)
                .select('*')
                .match(operation.conditions!)
                .single();

              result = await supabase
                .from(operation.table)
                .update(operation.data)
                .match(operation.conditions!)
                .select()
                .single();
              
              if (result.error) throw result.error;
              
              // Prepare rollback operation
              rollbackOps.push({
                ...operation,
                id: `rollback_${operation.id}`,
                type: 'update',
                data: currentData,
                conditions: operation.conditions,
                rollbackData: currentData
              });
              break;

            case 'delete':
              // Get data before deletion for rollback
              const { data: deletedData } = await supabase
                .from(operation.table)
                .select('*')
                .match(operation.conditions!)
                .single();

              result = await supabase
                .from(operation.table)
                .delete()
                .match(operation.conditions!)
                .select()
                .single();
              
              if (result.error) throw result.error;
              
              // Prepare rollback operation
              rollbackOps.push({
                ...operation,
                id: `rollback_${operation.id}`,
                type: 'insert',
                data: deletedData,
                rollbackData: deletedData
              });
              break;

            case 'upsert':
              result = await supabase
                .from(operation.table)
                .upsert(operation.data)
                .select()
                .single();
              
              if (result.error) throw result.error;
              break;

            default:
              throw new Error(`Unsupported operation type: ${operation.type}`);
          }

          results.push(result.data);
          affectedRows++;

          // Mark operation as completed
          setCurrentBatch(prev => prev ? {
            ...prev,
            operations: prev.operations.map(op => 
              op.id === operation.id ? { ...op, status: 'completed' } : op
            )
          } : null);

        } catch (operationError) {
          // Mark operation as failed
          setCurrentBatch(prev => prev ? {
            ...prev,
            operations: prev.operations.map(op => 
              op.id === operation.id ? { 
                ...op, 
                status: 'failed', 
                error: operationError instanceof Error ? operationError.message : String(operationError)
              } : op
            )
          } : null);

          // Attempt rollback of successful operations
          await rollbackOperations(rollbackOps.reverse());
          
          const transactionError: TransactionError = {
            batchId: currentBatch.id,
            operation,
            error: operationError instanceof Error ? operationError.message : String(operationError),
            rollbackAttempted: rollbackOps.length > 0,
            rollbackSuccess: true // Will be updated if rollback fails
          };

          onTransactionError?.(transactionError);
          throw operationError;
        }
      }

      // Transaction completed successfully
      const executionTime = Date.now() - startTime;
      const completedBatch = {
        ...currentBatch,
        status: 'completed' as const,
        endTime: new Date()
      };

      setCurrentBatch(completedBatch);
      setTransactionHistory(prev => [...prev, completedBatch]);
      
      // Clear optimistic updates
      setOptimisticUpdates(new Map());

      const result: TransactionResult = {
        batchId: currentBatch.id,
        success: true,
        operations: completedBatch.operations,
        affectedRows,
        executionTime
      };

      onTransactionComplete?.(result);
      return result;

    } catch (error) {
      // Transaction failed
      const failedBatch = {
        ...currentBatch,
        status: 'failed' as const,
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };

      setCurrentBatch(failedBatch);
      setTransactionHistory(prev => [...prev, failedBatch]);
      
      // Revert optimistic updates
      setOptimisticUpdates(new Map());

      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [currentBatch, supabase, onTransactionComplete, onTransactionError]);

  // Rollback operations
  const rollbackOperations = useCallback(async (operations: TransactionOperation[]) => {
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'insert':
            await supabase
              .from(operation.table)
              .insert(operation.data);
            break;
          case 'update':
            await supabase
              .from(operation.table)
              .update(operation.data)
              .match(operation.conditions!);
            break;
          case 'delete':
            await supabase
              .from(operation.table)
              .delete()
              .match(operation.conditions!);
            break;
        }
      } catch (rollbackError) {
        console.error('Rollback operation failed:', rollbackError);
        throw rollbackError;
      }
    }
  }, [supabase]);

  // Manual rollback of completed transaction
  const rollbackTransaction = useCallback(async (batchId: string) => {
    const batch = transactionHistory.find(b => b.id === batchId);
    if (!batch || batch.status !== 'completed') {
      throw new Error('Cannot rollback: batch not found or not completed');
    }

    try {
      const rollbackOps = batch.operations
        .filter(op => op.status === 'completed')
        .reverse()
        .map(op => {
          switch (op.type) {
            case 'insert':
              return { ...op, type: 'delete' as const, conditions: { id: op.data?.id } };
            case 'update':
              return { ...op, type: 'update' as const, data: op.rollbackData };
            case 'delete':
              return { ...op, type: 'insert' as const, data: op.rollbackData };
            default:
              return op;
          }
        });

      await rollbackOperations(rollbackOps);

      // Update batch status
      setTransactionHistory(prev => prev.map(b => 
        b.id === batchId ? { ...b, status: 'rolled_back' } : b
      ));

    } catch (error) {
      console.error('Manual rollback failed:', error);
      throw error;
    }
  }, [transactionHistory, rollbackOperations]);

  // Auto-rollback on timeout
  useEffect(() => {
    if (currentBatch && currentBatch.status === 'pending' && currentBatch.operations.length > 0) {
      rollbackTimeoutRef.current = setTimeout(() => {
        console.warn('Transaction timeout - auto-rolling back optimistic updates');
        setOptimisticUpdates(new Map());
        setCurrentBatch(null);
      }, 30000); // 30 second timeout
    }

    return () => {
      if (rollbackTimeoutRef.current) {
        clearTimeout(rollbackTimeoutRef.current);
      }
    };
  }, [currentBatch]);

  // CRUD operation helpers
  const createRecord = useCallback((data: DataRecord) => {
    if (!currentBatch) startTransaction();
    return addOperation('insert', data);
  }, [currentBatch, startTransaction, addOperation]);

  const updateRecord = useCallback((id: string, data: Partial<DataRecord>) => {
    if (!currentBatch) startTransaction();
    return addOperation('update', data, { id });
  }, [currentBatch, startTransaction, addOperation]);

  const deleteRecord = useCallback((id: string) => {
    if (!currentBatch) startTransaction();
    return addOperation('delete', undefined, { id });
  }, [currentBatch, startTransaction, addOperation]);

  const upsertRecord = useCallback((data: DataRecord) => {
    if (!currentBatch) startTransaction();
    return addOperation('upsert', data);
  }, [currentBatch, startTransaction, addOperation]);

  // Render transaction status
  const getStatusIcon = (status: TransactionBatch['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'executing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-warning" />;
      default:
        return <Database className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`bg-background border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Database className="h-5 w-5" />
          Transaction Manager
        </h3>
        
        <div className="flex items-center gap-2">
          {optimisticUpdates.size > 0 && (
            <Badge variant="secondary">
              {optimisticUpdates.size} optimistic updates
            </Badge>
          )}
          
          {currentBatch && (
            <Badge variant={currentBatch.status === 'completed' ? 'default' : 'secondary'}>
              {getStatusIcon(currentBatch.status)}
              <span className="ml-1">{currentBatch.operations.length} operations</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Current Transaction */}
      {currentBatch && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Transaction</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(currentBatch.status)}
              <span className="text-sm capitalize">{currentBatch.status}</span>
            </div>
          </div>
          
          <div className="space-y-xs">
            {currentBatch.operations.map((op, index) => (
              <div key={op.id} className="flex items-center justify-between text-sm">
                <span>{index + 1}. {op.type.toUpperCase()} {op.table}</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(op.status)}
                  {op.error && (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-3">
            {currentBatch.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCurrentBatch(null);
                    setOptimisticUpdates(new Map());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={executeTransaction}
                  disabled={isExecuting || currentBatch.operations.length === 0}
                >
                  {isExecuting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  Execute Transaction
                </Button>
              </>
            )}
            
            {currentBatch.status === 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => rollbackTransaction(currentBatch.id)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Rollback
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {transactionHistory.slice(-5).reverse().map(batch => (
              <div key={batch.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(batch.status)}
                  <span>{batch.operations.length} operations</span>
                  {batch.startTime && (
                    <span className="text-muted-foreground">
                      {batch.startTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                {batch.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rollbackTransaction(batch.id)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!currentBatch && (
        <div className="flex justify-center">
          <Button onClick={startTransaction} variant="outline">
            <Database className="h-4 w-4 mr-1" />
            Start New Transaction
          </Button>
        </div>
      )}
    </div>
  );
}

// Export CRUD helpers for external use
export const useDatabaseTransaction = (supabase: any, tableName: string) => {
  const [manager, setManager] = useState<any>(null);

  const createRecord = useCallback((data: DataRecord) => {
    return manager?.createRecord(data);
  }, [manager]);

  const updateRecord = useCallback((id: string, data: Partial<DataRecord>) => {
    return manager?.updateRecord(id, data);
  }, [manager]);

  const deleteRecord = useCallback((id: string) => {
    return manager?.deleteRecord(id);
  }, [manager]);

  const executeTransaction = useCallback(() => {
    return manager?.executeTransaction();
  }, [manager]);

  return {
    createRecord,
    updateRecord,
    deleteRecord,
    executeTransaction,
    setManager
  };
};
