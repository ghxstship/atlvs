'use client';
import { Calendar } from '@ghxstship/ui';
export function CompaniesCalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
