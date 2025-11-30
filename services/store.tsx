import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DailyLog, Purchase, Reward } from '../types';
import { CURRENT_USER, FRIEND_USER, INITIAL_LOGS } from './mockData';
import { calculatePoints } from './pointLogic';

interface AppState {
  user: User;
  friend: User;
  logs: DailyLog[];
  purchases: Purchase[];
  addLog: (logData: Omit<DailyLog, 'id' | 'userId' | 'score' | 'breakdown'>) => void;
  buyReward: (reward: Reward) => boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [friend] = useState<User>(FRIEND_USER);
  const [logs, setLogs] = useState<DailyLog[]>(INITIAL_LOGS);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const addLog = (logData: Omit<DailyLog, 'id' | 'userId' | 'score' | 'breakdown'>) => {
    const { total, breakdown } = calculatePoints(logData);
    
    const newLog: DailyLog = {
      ...logData,
      id: `${user.id}-${logData.date}`,
      userId: user.id,
      score: total,
      breakdown
    };

    // Optimistic update
    setLogs(prev => {
        // Remove existing log for this day if exists (edit mode)
        const filtered = prev.filter(l => l.date !== logData.date || l.userId !== user.id);
        return [...filtered, newLog];
    });

    setUser(prev => ({
      ...prev,
      balance: prev.balance + total,
      // Simple streak logic: if total > 0 add to streak
      currentStreak: total > 0 ? prev.currentStreak + 1 : 0
    }));
  };

  const buyReward = (reward: Reward): boolean => {
    if (user.balance < reward.cost) return false;

    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      date: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);
    setUser(prev => ({ ...prev, balance: prev.balance - reward.cost }));
    return true;
  };

  return (
    <AppContext.Provider value={{ user, friend, logs, purchases, addLog, buyReward }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
