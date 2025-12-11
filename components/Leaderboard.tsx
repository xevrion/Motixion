import React, { useState, useEffect } from 'react';
import { getDailyLeaderboard, getTotalPointsLeaderboard, getLongestStreakLeaderboard, LeaderboardUser } from '../services/leaderboard';
import { userRoleService } from '../services/userRoles';
import { Role } from '../types';
import { Loader2, Trophy, Star, TrendingUp } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAppStore } from '../services/store';

type LeaderboardTab = 'daily' | 'total' | 'streak';

const Leaderboard = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTopRoles, setUserTopRoles] = useState<Map<string, Role | null>>(new Map());

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      let data: LeaderboardUser[] = [];
      if (activeTab === 'daily') data = await getDailyLeaderboard();
      else if (activeTab === 'total') data = await getTotalPointsLeaderboard();
      else if (activeTab === 'streak') data = await getLongestStreakLeaderboard();
      setLeaderboardData(data);
      
      // Load top roles for all leaderboard users
      const rolesMap = new Map<string, Role | null>();
      await Promise.all(
        data.map(async (leaderboardUser) => {
          try {
            const topRole = await userRoleService.getUserTopRole(leaderboardUser.id);
            rolesMap.set(leaderboardUser.id, topRole);
          } catch (error) {
            console.error(`Error loading role for user ${leaderboardUser.id}:`, error);
            rolesMap.set(leaderboardUser.id, null);
          }
        })
      );
      setUserTopRoles(rolesMap);
      
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
        {leaderboardData.map((leaderboardUser, index) => {
          const isMe = user?.id === leaderboardUser.id;
          return (
            <div
              key={leaderboardUser.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isMe
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-l-4 border-emerald-500'
                  : index < 3
                  ? 'bg-zinc-200 dark:bg-zinc-800 border-l-4 border-yellow-500'
                  : 'bg-zinc-100 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">{getTrophyIcon(index)}</div>
                <Avatar
                  avatarUrl={leaderboardUser.avatar_url}
                  username={leaderboardUser.username}
                  size="md"
                  className={`flex-shrink-0 ${
                    isMe
                      ? 'bg-emerald-100 dark:bg-emerald-900'
                      : index < 3
                      ? 'bg-zinc-100 dark:bg-zinc-900'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
                <span className={`font-medium text-sm sm:text-base flex items-center gap-1.5 ${
                  isMe
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-zinc-900 dark:text-white'
                }`}>
                  {leaderboardUser.username}{isMe && ' (You)'}
                  {userTopRoles.get(leaderboardUser.id) && (
                    <>
                      {/* Mobile: just emoji, no box */}
                      <span
                        className="sm:hidden text-lg"
                        title={userTopRoles.get(leaderboardUser.id)?.name}
                      >
                        {userTopRoles.get(leaderboardUser.id)?.emoji}
                      </span>
                      {/* Desktop: emoji and name with box */}
                      <span
                        className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm"
                        title={userTopRoles.get(leaderboardUser.id)?.name}
                      >
                        {userTopRoles.get(leaderboardUser.id)?.emoji}
                        <span className="font-semibold">{userTopRoles.get(leaderboardUser.id)?.name}</span>
                      </span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-bold ${
                  isMe
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {leaderboardUser.score}
                </span>

                {activeTab === 'daily' && (
                  <TrendingUp size={16} className="text-emerald-500" />
                )}
                {activeTab === 'total' && (
                  <Star size={16} className="text-yellow-500" />
                )}
                {activeTab === 'streak' && (
                  <TrendingUp size={16} className="text-emerald-500" />
                )}
              </div>
            </div>
          );
        })}
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
