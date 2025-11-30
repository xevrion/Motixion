export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  balance: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  wakeTime: string; // HH:MM
  studyHours: number;
  breakHours: number;
  wastedHours: number;
  tasksAssigned: number;
  tasksCompleted: number;
  notes: string;
  // Calculated fields
  score: number;
  breakdown: {
    study: number;
    tasks: number;
    wake: number;
    waste: number;
  };
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  category: 'food' | 'leisure' | 'upgrade' | 'misc';
}

export interface Purchase {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  date: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LOG = 'LOG',
  FRIEND = 'FRIEND',
  SHOP = 'SHOP',
  PROFILE = 'PROFILE',
  AI_COACH = 'AI_COACH'
}
