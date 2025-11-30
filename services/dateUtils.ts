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
 * Gets the current "app date" accounting for 5am cutoff
 *
 * If it's before 5am, returns yesterday's date
 * Otherwise returns today's date
 */
export const getAppDate = (): string => {
  const now = new Date();
  const hours = now.getHours();

  // If it's before 5am, use yesterday's date
  if (hours < 5) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Otherwise use today's date
  return now.toISOString().split('T')[0];
};

/**
 * Checks if a given date string matches today's app date
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getAppDate();
};

/**
 * Gets a human-readable description of when the day resets
 */
export const getResetTimeDescription = (): string => {
  return "Daily reset at 5:00 AM";
};
