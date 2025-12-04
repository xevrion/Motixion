import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DailyLog, Purchase, Reward, CustomReward } from '../types';
import { supabase } from './supabase';
import { dailyLogService } from './dailyLog';
import { authService } from './auth';
import { customRewardService, CustomRewardInput } from './customRewards';
import { getToday } from './dateUtils';

interface AppState {
  user: User | null;
  friend: User | null;
  logs: DailyLog[];
  purchases: Purchase[];
  customRewards: CustomReward[];
  loading: boolean;
  addLog: (logData: Omit<DailyLog, 'id' | 'userId' | 'score' | 'breakdown'>) => Promise<void>;
  buyReward: (reward: Reward) => Promise<boolean>;
  addCustomReward: (rewardData: CustomRewardInput) => Promise<void>;
  updateCustomReward: (rewardId: string, updates: Partial<CustomRewardInput>) => Promise<void>;
  deleteCustomReward: (rewardId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [friend, setFriend] = useState<User | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user data from Supabase
  const fetchUserData = async () => {
    try {
      const authUser = await authService.getCurrentUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Sync avatar from Google OAuth on every sign-in
      try {
        await supabase.rpc('sync_my_avatar');
      } catch (syncError) {
        // Silently fail if function doesn't exist yet (for backwards compatibility)
        console.warn('Avatar sync failed (this is okay if function not deployed yet):', syncError);
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Database error:', error);
        if (error.message.includes('relation "public.users" does not exist')) {
          alert('❌ Database not set up!\n\n1. Go to your Supabase dashboard\n2. Open SQL Editor\n3. Run the supabase-schema.sql file\n\nSee README.md for details.');
        }
        throw error;
      }

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
          rewardId: p.reward_id || p.id,
          rewardName: p.reward_name,
          cost: p.points_spent,
          date: p.date
        })));
      }

      // Fetch custom rewards
      const userCustomRewards = await customRewardService.getUserCustomRewards(authUser.id);
      setCustomRewards(userCustomRewards);
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
      // Insert purchase (store reward_id if it's a custom reward)
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          reward_name: reward.name,
          reward_id: reward.isCustom ? reward.id : null,
          points_spent: reward.cost,
          date: getToday()
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

  const addCustomReward = async (rewardData: CustomRewardInput): Promise<void> => {
    if (!user) return;

    try {
      await customRewardService.createCustomReward(user.id, rewardData);
      await fetchUserData();
    } catch (error) {
      console.error('Error adding custom reward:', error);
      throw error;
    }
  };

  const updateCustomReward = async (rewardId: string, updates: Partial<CustomRewardInput>): Promise<void> => {
    try {
      await customRewardService.updateCustomReward(rewardId, updates);
      await fetchUserData();
    } catch (error) {
      console.error('Error updating custom reward:', error);
      throw error;
    }
  };

  const deleteCustomReward = async (rewardId: string): Promise<void> => {
    try {
      await customRewardService.deleteCustomReward(rewardId);
      await fetchUserData();
    } catch (error) {
      console.error('Error deleting custom reward:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      friend, 
      logs, 
      purchases, 
      customRewards, 
      loading, 
      addLog, 
      buyReward, 
      addCustomReward, 
      updateCustomReward, 
      deleteCustomReward, 
      refreshData 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
