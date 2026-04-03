import { formatDistanceToNow, format } from 'date-fns';

const parseDate = (date: string | Date | undefined | null): Date | null => {
  if (!date) return null;

  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (date: string | Date): string => {
  const parsed = parseDate(date);
  if (!parsed) return '—';

  return format(parsed, 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date): string => {
  const parsed = parseDate(date);
  if (!parsed) return '--:--';

  return format(parsed, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const parsed = parseDate(date);
  if (!parsed) return 'Just now';

  return formatDistanceToNow(parsed, { addSuffix: true });
};

export const formatSessionDuration = (startTime: string, endTime: string): string => {
  const start = parseDate(startTime);
  const end = parseDate(endTime);

  if (!start || !end) return '0m';

  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}m`;
};