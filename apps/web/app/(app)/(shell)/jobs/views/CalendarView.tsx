'use client';

import { Calendar } from 'lucide-react';
import {
  Calendar,
  CalendarView
} from "@ghxstship/ui";

export function CalendarView({ data, onEventClick }: any) {
  return <Calendar events={data} onEventClick={onEventClick} />;
}
