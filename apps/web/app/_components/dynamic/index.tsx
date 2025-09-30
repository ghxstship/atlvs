/**
 * Dynamic imports for heavy components
 * Implements code splitting and lazy loading for performance optimization
 */

import dynamic from 'next/dynamic';

/**
 * Heavy chart components - loaded on demand
 * Use for analytics dashboards and data visualization
 */
export const DynamicChart = dynamic(
  () => import('@ghxstship/ui').then((mod) => mod.Card),
  { ssr: false }
);

/**
 * Data table components - loaded on demand for large datasets
 * Use for tables with 100+ rows
 */
export const DynamicDataTable = dynamic(
  () => import('@ghxstship/ui').then((mod) => mod.DataGrid)
);

/**
 * Kanban board - loaded on demand for project views
 * Use for project management and workflow visualization
 */
export const DynamicKanban = dynamic(
  () => import('@ghxstship/ui').then((mod) => mod.KanbanBoard)
);

/**
 * Calendar components - loaded on demand
 * Use for scheduling and event management
 */
export const DynamicCalendar = dynamic(
  () => import('@ghxstship/ui').then((mod) => mod.Card)
);

/**
 * Analytics dashboard - loaded on demand
 * Use for business intelligence and reporting
 */
export const DynamicAnalyticsDashboard = dynamic(
  () => import('@ghxstship/ui').then((mod) => mod.Card)
);

/**
 * Export all dynamic components
 */
export { default as dynamic } from 'next/dynamic';
