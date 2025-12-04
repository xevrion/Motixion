import { supabase } from './supabase';
import { getToday } from './dateUtils';

export interface LeaderboardUser {
  id: string;
  username: string;
  score: number;
  avatar_url?: string | null;
}

export const getDailyLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const today = getToday();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('total_points, users (id, username, avatar_url)')
    .eq('date', today)
    .order('total_points', { ascending: false })
    .limit(15);

  if (error) {
    console.error('Error fetching daily leaderboard:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.users.id,
    username: row.users.username,
    score: row.total_points,
    avatar_url: row.users.avatar_url,
  }));
};

export const getTotalPointsLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, balance, avatar_url')
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
