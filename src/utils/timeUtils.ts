/**
 * Format seconds into HH:MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? `${hours}:` : '';
  const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Get a formatted time string (e.g., "3:45 PM")
 */
export const formatTimeOfDay = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

/**
 * Calculate duration between two dates and format it
 */
export const calculateDuration = (startDate: Date, endDate: Date): string => {
  const durationInSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  return formatTime(durationInSeconds);
}; 