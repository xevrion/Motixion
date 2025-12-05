import { supabase } from './supabase';

/**
 * Fetches the total number of registered users in the app.
 * Uses a database function that bypasses RLS for public display.
 * 
 * @returns The total user count, or 0 if there's an error
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_total_user_count');

    if (error) {
      console.error('Error fetching user count:', error);
      // Fallback to direct query if function doesn't exist yet
      const { count, error: fallbackError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return 0;
      }
      
      return count ?? 0;
    }

    return data ?? 0;
  } catch (error) {
    console.error('Unexpected error fetching user count:', error);
    return 0;
  }
};

