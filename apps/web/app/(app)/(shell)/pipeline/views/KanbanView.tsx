'use client';

import { KanbanBoard } from '@ghxstship/ui';

export function KanbanView({ data, onCardClick }: any) {
  return <KanbanBoard data={data} onCardClick={onCardClick} />;
}
