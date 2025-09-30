'use client';
import { Calendar } from '@ghxstship/ui';
export function SettingsCalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
