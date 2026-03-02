// src/lib/utils/helpers.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isThisWeek, isThisMonth, isPast, isFuture, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(parseISO(date as string), 'MMMM dd, yyyy');
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
}

export function getEventStatusColor(status: string): string {
  const colors = {
    upcoming: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ongoing: 'bg-amber-100 text-amber-800 border-amber-200',
    completed: 'bg-slate-100 text-slate-800 border-slate-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status as keyof typeof colors] || colors.upcoming;
}

export function filterEventsByDateRange(events: any[], range: string): any[] {
  const now = new Date();
  
  switch (range) {
    case 'this-week':
      return events.filter(e => isThisWeek(parseISO(e.date)));
    case 'this-month':
      return events.filter(e => isThisMonth(parseISO(e.date)));
    case 'upcoming':
      return events.filter(e => isFuture(parseISO(e.date)));
    case 'past':
      return events.filter(e => isPast(parseISO(e.date)));
    default:
      return events;
  }
}

