import { format, startOfWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(dateStr: string | undefined, fmt = 'd MMMM yyyy'): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), fmt, { locale: ru });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return dateStr;
  }
}

export function getCurrentWeekStart(): string {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  return format(start, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
