import React, { useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { userRoleService } from '../services/userRoles';
import { Role } from '../types';
import { Award, Calendar, History, CalendarDays, LogOut } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';
import { Avatar } from './Avatar';

export const Profile: React.FC = () => {
  const { user, purchases, loading, logs } = useAppStore();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserRoles();
    }
  }, [user]);

  const loadUserRoles = async () => {
    if (!user) return;
    try {
      setLoadingRoles(true);
      const roles = await userRoleService.getUserRoles(user.id);
      setUserRoles(roles);
    } catch (error) {
      console.error('Error loading user roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userPurchases = purchases.filter((p) => p.userId === user.id);
  const totalHoursStudied = logs.reduce((sum, log) => sum + log.studyHours, 0);
  const totalDaysLogged = logs.length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Your Profile</h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your account and view your achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* USER CARD */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col items-center">
            <div className="mb-4 sm:mb-6 relative">
              <Avatar
                avatarUrl={user.avatarUrl}
                username={user.username}
                size
                showBorder={true}
                borderColor="border-emerald-500"
              />
              <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-lg flex items-center gap-1">
                <Award size={12} className="text-yellow-500" />
                Lvl {Math.floor(user.totalPointsEarned / 100) + 1}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {user.username}
            </h2>

            {/* User Roles */}
            {!loadingRoles && userRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {userRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-300 dark:border-zinc-700"
                  >
                    <span className="text-sm">{role.emoji}</span>
                    <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {role.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 w-full mt-6">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors text-zinc-600 dark:text-zinc-400">
                <CalendarDays size={18} />
                <span className="text-sm">
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </span>
              </div>

              <button
                onClick={async () => {
                  const { authService } = await import('../services/auth');
                  await authService.signOut();
                  window.location.reload();
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-500/10 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-zinc-900 dark:text-white font-bold">Lifetime Stats</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Total Hours</span>
                <span className="text-zinc-900 dark:text-white font-bold">
                  {totalHoursStudied.toFixed(1)}h
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Days Logged</span>
                <span className="text-zinc-900 dark:text-white font-bold">{totalDaysLogged}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Best Streak</span>
                <span className="text-zinc-900 dark:text-white font-bold">{user.bestStreak} days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Total Balance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user.balance} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Total Points Earned</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user.totalPointsEarned} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Total Points Spent</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{user.totalPointsEarned - user.balance} pts</span>
              </div>
            </div>
          </div>

          {/* NOTIFICATION SETTINGS */}
          <NotificationSettings userId={user.id} />
        </div>

        {/* RIGHT COLUMN: PURCHASE HISTORY */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px] sm:min-h-[500px]">
          <div className="p-4 sm:p-6 border-b border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <div className="p-2 bg-zinc-200 dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800">
              <History size={18} className="text-emerald-500" />
            </div>

            <h3 className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">
              Purchase History
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2 overflow-x-auto">
            {userPurchases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-600 gap-4 opacity-60">
                <History size={48} strokeWidth={1} />
                <p>No rewards redeemed yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-zinc-600 dark:text-zinc-500 text-xs uppercase border-b border-zinc-300 dark:border-zinc-800">
                    <th className="p-3 sm:p-4 font-medium">Reward</th>
                    <th className="p-3 sm:p-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="p-3 sm:p-4 font-medium">Date</th>
                    <th className="p-3 sm:p-4 font-medium text-right">Cost</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-300 dark:divide-zinc-800">
                  {userPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors">
                      <td className="p-3 sm:p-4 text-zinc-900 dark:text-white font-medium text-sm">
                        {p.rewardName}
                      </td>

                      <td className="p-3 sm:p-4 hidden sm:table-cell">
                        <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                          Redeemed
                        </span>
                      </td>

                      <td className="p-3 sm:p-4 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="hidden sm:block" />
                          {new Date(p.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>

                      <td className="p-3 sm:p-4 text-rose-600 dark:text-rose-400 font-bold text-right font-mono text-sm">
                        -{p.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
