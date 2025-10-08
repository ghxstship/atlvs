'use client';

import { Calendar } from '@ghxstship/ui';
import { Calendar } from 'lucide-react';

export function CalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
