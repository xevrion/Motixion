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
    // Try RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_user_count');

    if (!rpcError && rpcData !== null && rpcData !== undefined) {
      const count = Number(rpcData);
      if (!Number.isNaN(count)) {
        return count;
      }
    }

    if (rpcError) {
      console.warn('RPC failed, using fallback:', rpcError.message);
    }

    // Fallback: proper count query
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Fallback count failed:', error);
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    console.error('Unexpected error:', err);
    return 0;
  }
};


