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
    // This should work even for anonymous users since it's SECURITY DEFINER
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_user_count');
    
    if (!rpcError && rpcData !== null && rpcData !== undefined) {
      const count = typeof rpcData === 'number' ? rpcData : parseInt(String(rpcData), 10);
      if (!isNaN(count) && count > 0) {
        return count;
      }
    }

    if (rpcError) {
      console.warn('RPC function failed, trying fallback:', rpcError);
    }

    // Fallback: Use same pattern as getTotalPointsLeaderboard - select minimal field and count
    // This works because RLS policy allows SELECT for all users (authenticated or not)
    // The RLS policy "Users can view all profiles" uses USING (true) which allows anonymous access
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    if (error) {
      console.error('Error fetching user count (fallback):', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return 0;
    }

    // If count is available, use it; otherwise count the array
    if (data && Array.isArray(data)) {
      return data.length;
    }

    return 0;
  } catch (error) {
    console.error('Unexpected error fetching user count:', error);
    return 0;
  }
};

