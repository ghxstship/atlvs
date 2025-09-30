'use client';
import { KanbanBoard } from '@ghxstship/ui';
export function CompaniesKanbanView({ data, onCardClick }: any) {
  return <KanbanBoard data={data} onCardClick={onCardClick} groupBy="status" />;
}
