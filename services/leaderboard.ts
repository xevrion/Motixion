import { supabase } from './supabase';

export interface LeaderboardUser {
  id: string;
  username: string;
  score: number;
  avatar_url?: string | null;
}

export const getDailyLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase.rpc('get_daily_leaderboard');

  if (error) {
    console.error('Error fetching daily leaderboard:', error);
    return [];
  }

  return data || [];
};

export const getTotalPointsLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, balance, avatar_url')
    .gt('balance', 0)
    .order('balance', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching total points leaderboard:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    username: row.username,
    score: row.balance,
    avatar_url: row.avatar_url,
  }));
};

export const getLongestStreakLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, best_streak, avatar_url')
    .gt('best_streak', 0)
    .order('best_streak', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching longest streak leaderboard:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    username: row.username,
    score: row.best_streak,
    avatar_url: row.avatar_url,
  }));
};
