import { supabase } from './supabase';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const friendService = {
  // Search for users by username or email
  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  },

  // Send friend request
  async sendFriendRequest(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all friend requests (both sent and received)
  async getFriendRequests(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user:users!friendships_user_id_fkey(id, username, avatar_url),
        friend:users!friendships_friend_id_fkey(id, username, avatar_url)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  // Get all accepted friends
  async getFriends(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user:users!friendships_user_id_fkey(id, username, avatar_url, balance, current_streak, best_streak),
        friend:users!friendships_friend_id_fkey(id, username, avatar_url, balance, current_streak, best_streak)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;

    // Return the friend user object (not the current user)
    return data.map(friendship => {
      return friendship.user_id === userId ? friendship.friend : friendship.user;
    });
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reject friend request
  async rejectFriendRequest(friendshipId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove friendship
  async removeFriend(friendshipId: string) {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
  },

  // Get friend's daily logs
  async getFriendLogs(friendId: string, limit?: number) {
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', friendId)
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get all friends with today's log data
  async getFriendsWithTodayData(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get accepted friends
    const friends = await this.getFriends(userId);

    // Get today's logs for all friends
    const friendIds = friends.map(f => f.id);
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .in('user_id', friendIds)
      .eq('date', today);

    if (error) throw error;

    // Merge friend data with today's log
    return friends.map(friend => {
      const todayLog = logs?.find(log => log.user_id === friend.id);
      return {
        ...friend,
        todayPoints: todayLog?.total_points || 0,
        todayLog: todayLog || null
      };
    });
  }
};
