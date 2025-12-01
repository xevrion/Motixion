/**
 * Date Utility Functions
 *
 * Daily reset happens at 5:00 AM local time
 * (following YeolPumta/YPT pattern)
 *
 * Examples:
 * - 4:59 AM = counts as yesterday
 * - 5:00 AM = counts as today
 */

/**
 * Formats a date to YYYY-MM-DD using local time (not UTC)
 */
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current "app date" accounting for 5am cutoff
 *
 * If it's before 5am, returns yesterday's date
 * Otherwise returns today's date
 * 
 * IMPORTANT: Uses LOCAL time, not UTC, to prevent timezone issues
 */
export const getToday = (): string => {
  const now = new Date();
  const hours = now.getHours();

  // If it's before 5am, use yesterday's date
  if (hours < 5) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatLocalDate(yesterday);
  }

  // Otherwise use today's date
  return formatLocalDate(now);
};

/**
 * Checks if a given date string matches today's app date
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getToday();
};

/**
 * Gets a human-readable description of when the day resets
 */
export const getResetTimeDescription = (): string => {
  return "Daily reset at 5:00 AM";
};

/**
 * Gets the next time the app day will change (at 5:00 AM)
 * Returns milliseconds until next reset
 */
export const getMsUntilNextReset = (): number => {
  const now = new Date();
  const resetTime = new Date(now);
  
  // Set to 5:00 AM today
  resetTime.setHours(5, 0, 0, 0);
  
  // If it's already past 5 AM today, set to 5 AM tomorrow
  if (now.getTime() >= resetTime.getTime()) {
    resetTime.setDate(resetTime.getDate() + 1);
  }
  
  return resetTime.getTime() - now.getTime();
};

/**
 * Gets the current app date and timestamp for comparison
 * Useful for detecting when the app day actually changes
 */
export const getTodayWithTimestamp = (): { date: string; timestamp: number } => {
  const date = getToday();
  // Create a timestamp at 5 AM for this app date
  const [year, month, day] = date.split('-').map(Number);
  const timestamp = new Date(year, month - 1, day, 5, 0, 0, 0).getTime();
  return { date, timestamp };
};
