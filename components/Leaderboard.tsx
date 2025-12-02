import React, { useState, useEffect } from 'react';
import { getDailyLeaderboard, getTotalPointsLeaderboard, getLongestStreakLeaderboard, LeaderboardUser } from '../services/leaderboard';
import { Loader2, Trophy, Star, TrendingUp } from 'lucide-react';

type LeaderboardTab = 'daily' | 'total' | 'streak';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      let data: LeaderboardUser[] = [];
      if (activeTab === 'daily') data = await getDailyLeaderboard();
      else if (activeTab === 'total') data = await getTotalPointsLeaderboard();
      else if (activeTab === 'streak') data = await getLongestStreakLeaderboard();
      setLeaderboardData(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [activeTab]);

  const TabButton = ({ tab, label }: { tab: LeaderboardTab; label: string }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-emerald-500 text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        {label}
      </button>
    );
  };

  const getTrophyIcon = (index: number) => {
    if (index === 0) return <Trophy size={24} className="text-yellow-500" />;
    if (index === 1) return <Trophy size={24} className="text-zinc-400" />;
    if (index === 2) return <Trophy size={24} className="text-orange-400" />;
    return (
      <span className="text-lg font-bold text-zinc-500 w-8 text-center">
        {index + 1}
      </span>
    );
  };

  const LeaderboardList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
        </div>
      );
    }

    if (leaderboardData.length === 0) {
      return (
        <div className="text-center text-zinc-600 dark:text-zinc-500 py-8">
          No data available yet. Check back tomorrow!
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              index < 3
                ? 'bg-zinc-200 dark:bg-zinc-800 border-l-4 border-yellow-500'
                : 'bg-zinc-100 dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">{getTrophyIcon(index)}</div>
              <span className="font-medium text-zinc-900 dark:text-white text-sm sm:text-base">
                {user.username}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {user.score}
              </span>

              {activeTab === 'daily' && (
                <TrendingUp size={16} className="text-emerald-500" />
              )}
              {activeTab === 'total' && (
                <Star size={16} className="text-yellow-500" />
              )}
              {activeTab === 'streak' && (
                <TrendingUp size={16} className="text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Global Leaderboard</h1>

        <div className="flex items-center gap-2 p-1 bg-zinc-200 dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-800 self-start sm:self-center">
          <TabButton tab="daily" label="Daily" />
          <TabButton tab="total" label="Total" />
          <TabButton tab="streak" label="Streak" />
        </div>
      </div>

      <LeaderboardList />
    </div>
  );
};

export default Leaderboard;
