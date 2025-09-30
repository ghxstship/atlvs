'use client';

import { Calendar } from '@ghxstship/ui';

export function CalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
