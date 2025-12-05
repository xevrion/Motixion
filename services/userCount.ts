import { supabase } from './supabase';

/**
 * Fetches the total number of registered users in the app.
 * Uses the same pattern as getTotalPointsLeaderboard - selects minimal data and counts.
 * This works for unauthenticated users since RLS allows SELECT.
 * 
 * @returns The total user count, or 0 if there's an error
 */
export const getTotalUserCount = async (): Promise<number> => {
  try {
    // Try RPC function first (bypasses RLS, most efficient)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_user_count');
    
    if (!rpcError && rpcData !== null && rpcData !== undefined) {
      const count = typeof rpcData === 'number' ? rpcData : parseInt(String(rpcData), 10);
      if (!isNaN(count)) {
        return count;
      }
    }

    // Fallback: Use same pattern as getTotalPointsLeaderboard - select minimal field and count
    // This works because RLS policy allows SELECT for all users (authenticated or not)
    const { data, error } = await supabase
      .from('users')
      .select('id');

    if (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }

    return data?.length ?? 0;
  } catch (error) {
    console.error('Unexpected error fetching user count:', error);
    return 0;
  }
};

