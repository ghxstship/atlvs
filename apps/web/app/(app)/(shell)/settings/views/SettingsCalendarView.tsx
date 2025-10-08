'use client';
import { Calendar } from 'lucide-react';
import { Calendar } from '@ghxstship/ui';
export function SettingsCalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
