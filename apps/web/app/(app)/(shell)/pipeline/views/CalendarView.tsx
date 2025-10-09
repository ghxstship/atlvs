'use client';

import {
  Calendar,
  CalendarView
} from "@ghxstship/ui";
import { Calendar } from 'lucide-react';

export function CalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
