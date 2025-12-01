import { useState, useEffect, useRef } from 'react';
import { getToday, getMsUntilNextReset } from './dateUtils';

/**
 * Custom hook that provides the current app date (with 5 AM cutoff)
 * and automatically updates when the app day changes (at 5:00 AM)
 * 
 * This prevents components from seeing a "reset" at midnight.
 * Components will only see the date change at 5:00 AM.
 */
export const useAppDate = () => {
  const [appDate, setAppDate] = useState<string>(getToday());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateAppDate = () => {
      const newDate = getToday();
      setAppDate(newDate);
      
      // Schedule next update for when the app day actually changes (5 AM)
      const msUntilReset = getMsUntilNextReset();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        updateAppDate();
      }, msUntilReset);
    };

    // Initial update
    updateAppDate();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return appDate;
};

