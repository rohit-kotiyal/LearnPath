import { formatDistanceToNow, format } from 'date-fns';
 
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};
 
export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm');
};
 
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
 
export const formatSessionDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};