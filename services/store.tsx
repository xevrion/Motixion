import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DailyLog, Purchase, Reward } from '../types';
import { supabase } from './supabase';
import { dailyLogService } from './dailyLog';
import { authService } from './auth';

interface AppState {
  user: User | null;
  friend: User | null;
  logs: DailyLog[];
  purchases: Purchase[];
  loading: boolean;
  addLog: (logData: Omit<DailyLog, 'id' | 'userId' | 'score' | 'breakdown'>) => Promise<void>;
  buyReward: (reward: Reward) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [friend, setFriend] = useState<User | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user data from Supabase
  const fetchUserData = async () => {
    try {
      const authUser = await authService.getCurrentUser();
      if (!authUser) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUser({
        id: userData.id,
        username: userData.username,
        avatarUrl: userData.avatar_url || '',
        balance: userData.balance || 0,
        currentStreak: userData.current_streak || 0,
        bestStreak: userData.best_streak || 0,
        joinedAt: userData.joined_at
      });

      // Fetch user's logs
      const userLogs = await dailyLogService.getUserLogs(authUser.id);
      setLogs(userLogs.map(log => ({
        id: log.id,
        date: log.date,
        userId: log.user_id,
        wakeTime: log.wake_time,
        studyHours: log.study_hours,
        breakHours: log.break_hours,
        wastedHours: log.wasted_time,
        tasksAssigned: log.tasks_assigned,
        tasksCompleted: log.tasks_completed,
        notes: log.notes,
        score: log.total_points,
        breakdown: {
          study: log.hour_score,
          tasks: log.task_score,
          wake: log.wake_score,
          waste: -log.penalties
        }
      })));

      // Fetch purchases
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (purchaseData) {
        setPurchases(purchaseData.map(p => ({
          id: p.id,
          userId: p.user_id,
          rewardId: p.id,
          rewardName: p.reward_name,
          cost: p.points_spent,
          date: p.date
        })));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const addLog = async (logData: Omit<DailyLog, 'id' | 'userId' | 'score' | 'breakdown'>) => {
    if (!user) return;

    try {
      await dailyLogService.saveDailyLog(user.id, {
        date: logData.date,
        wakeTime: logData.wakeTime,
        studyHours: logData.studyHours,
        breakHours: logData.breakHours,
        wastedHours: logData.wastedHours,
        tasksAssigned: logData.tasksAssigned,
        tasksCompleted: logData.tasksCompleted,
        notes: logData.notes
      });

      // Refresh data after logging
      await fetchUserData();
    } catch (error) {
      console.error('Error adding log:', error);
      throw error;
    }
  };

  const buyReward = async (reward: Reward): Promise<boolean> => {
    if (!user || user.balance < reward.cost) return false;

    try {
      // Insert purchase
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          reward_name: reward.name,
          points_spent: reward.cost,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Update user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: user.balance - reward.cost })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh data
      await fetchUserData();
      return true;
    } catch (error) {
      console.error('Error buying reward:', error);
      return false;
    }
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  return (
    <AppContext.Provider value={{ user, friend, logs, purchases, loading, addLog, buyReward, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
