'use client';

import * as React from 'react';
import { DataRecord, ViewConfig } from '../types/data-views';

interface StateManagerContextValue {
  data: DataRecord[];
  loading: boolean;
  error: string | null;
  config: ViewConfig | null;
  setData: (data: DataRecord[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConfig: (config: ViewConfig) => void;
  addRecord: (record: DataRecord) => void;
  updateRecord: (id: string, updates: Partial<DataRecord>) => void;
  deleteRecord: (id: string) => void;
}

const StateManagerContext = React.createContext<StateManagerContextValue | null>(null);

export interface StateManagerProviderProps {
  children: React.ReactNode;
  initialData?: DataRecord[];
  initialConfig?: ViewConfig;
}

export function StateManagerProvider({ 
  children, 
  initialData = [], 
  initialConfig 
}: StateManagerProviderProps) {
  const [data, setData] = React.useState<DataRecord[]>(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<ViewConfig | null>(initialConfig || null);

  const addRecord = React.useCallback((record: DataRecord) => {
    setData(prev => [...prev, record]);
  }, []);

  const updateRecord = React.useCallback((id: string, updates: Partial<DataRecord>) => {
    setData(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  }, []);

  const deleteRecord = React.useCallback((id: string) => {
    setData(prev => prev.filter(record => record.id !== id));
  }, []);

  const value = React.useMemo(() => ({
    data,
    loading,
    error,
    config,
    setData,
    setLoading,
    setError,
    setConfig,
    addRecord,
    updateRecord,
    deleteRecord,
  }), [data, loading, error, config, addRecord, updateRecord, deleteRecord]);

  return (
    <StateManagerContext.Provider value={value}>
      {children}
    </StateManagerContext.Provider>
  );
}

export function useStateManager() {
  const context = React.useContext(StateManagerContext);
  if (!context) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return context;
}

export { StateManagerContext };
