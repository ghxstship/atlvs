// Global type definitions for GHXSTSHIP Enterprise Platform

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

// Form interfaces
export interface FormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: unknown;
}

// API response interface
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Client component props
export interface ClientProps {
  className?: string;
  children?: React.ReactNode;
}

// Data view interfaces
export interface DataViewProps {
  data: unknown[];
  loading?: boolean;
  error?: string;
}

export {};
