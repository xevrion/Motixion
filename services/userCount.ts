import { supabase } from './supabase';

/**
 * Fetches the total number of registered users in the app.
 * Uses a simple count query on the users table.
 * 
 * @returns The total user count, or 0 if there's an error
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error('Unexpected error fetching user count:', error);
    return 0;
  }
};

