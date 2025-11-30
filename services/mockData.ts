import { User, DailyLog, Reward } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  username: 'You',
  avatarUrl: 'https://picsum.photos/200/200?random=1',
  balance: 145,
  currentStreak: 4,
  bestStreak: 12,
  joinedAt: '2023-01-01'
};

export const FRIEND_USER: User = {
  id: 'u2',
  username: 'Alex',
  avatarUrl: 'https://picsum.photos/200/200?random=2',
  balance: 80,
  currentStreak: 12,
  bestStreak: 24,
  joinedAt: '2023-01-05'
};

export const REWARDS: Reward[] = [
  { id: 'r1', name: 'Ramen Night', cost: 50, icon: '🍜', category: 'food' },
  { id: 'r2', name: 'New Book', cost: 100, icon: '📚', category: 'leisure' },
  { id: 'r3', name: 'Movie Ticket', cost: 80, icon: '🎬', category: 'leisure' },
  { id: 'r4', name: 'Fancy Coffee', cost: 30, icon: '☕', category: 'food' },
  { id: 'r5', name: 'Day Off', cost: 300, icon: '🏖️', category: 'leisure' },
  { id: 'r6', name: 'Desk Upgrade', cost: 500, icon: '💻', category: 'upgrade' },
];

const generatePastLogs = (userId: string, days: number): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (i + 1));
    const dateStr = d.toISOString().split('T')[0];
    
    // Randomize activity
    const study = Math.floor(Math.random() * 6) + 1;
    const waste = Math.floor(Math.random() * 2);
    const assigned = 5;
    const completed = Math.floor(Math.random() * 4) + 2;
    
    // Simple point calc approximation for mock data
    const score = (study * 5) + 10 - (waste * 5); 

    logs.push({
      id: `${userId}-${dateStr}`,
      userId,
      date: dateStr,
      wakeTime: '07:30',
      studyHours: study,
      breakHours: 1,
      wastedHours: waste,
      tasksAssigned: assigned,
      tasksCompleted: completed,
      notes: 'Simulated past day',
      score: score,
      breakdown: { study: study * 5, tasks: 10, wake: 5, waste: -waste * 5 }
    });
  }
  return logs.reverse();
};

export const INITIAL_LOGS: DailyLog[] = [
  ...generatePastLogs(CURRENT_USER.id, 7),
  ...generatePastLogs(FRIEND_USER.id, 7)
];
