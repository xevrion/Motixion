import { supabase } from './supabase';

/**
 * Fetches the total number of registered users in the app.
 * Uses multiple fallback methods to ensure it works in all environments.
 * 
 * @returns The total user count, or 0 if there's an error
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    // Method 1: Try RPC function first (bypasses RLS, most reliable)
    try {
      const { data, error } = await supabase.rpc('get_total_user_count');
      if (!error && data !== null && data !== undefined) {
        const count = typeof data === 'number' ? data : parseInt(String(data), 10);
        if (!isNaN(count)) {
          return count;
        }
      }
    } catch (rpcError) {
      console.warn('RPC function not available or failed:', rpcError);
    }

    // Method 2: Direct count query (should work since RLS allows SELECT for all)
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (!countError && count !== null && count !== undefined) {
      return count;
    }

    console.warn('Count query failed:', countError);

    // Method 3: Select minimal data and count in JS (last resort)
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id')
      .limit(10000); // Reasonable limit

    if (!selectError && Array.isArray(users)) {
      return users.length;
    }

    console.error('All methods failed. Last error:', selectError || countError);
    return 0;
  } catch (error) {
    console.error('Unexpected error fetching user count:', error);
    return 0;
  }
};

