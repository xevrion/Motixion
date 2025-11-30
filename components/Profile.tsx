import React from 'react';
import { useAppStore } from '../services/store';
import { Award, Calendar, History, Mail, CalendarDays } from 'lucide-react';
import { AICoach } from './AICoach';

export const Profile: React.FC = () => {
  const { user, purchases, loading, logs } = useAppStore();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userPurchases = purchases.filter(p => p.userId === user.id);
  const totalHoursStudied = logs.reduce((sum, log) => sum + log.studyHours, 0);
  const totalDaysLogged = logs.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Your Profile</h2>
        <p className="text-zinc-400 mt-1">Manage your account and view your achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: User Info & Stats */}
        <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center">
                <div className="w-32 h-32 rounded-full p-1 border-4 border-emerald-500 mb-6 relative">
                    <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-5xl font-bold text-emerald-500">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-zinc-900 text-white text-sm font-bold px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1 shadow-lg">
                        <Award size={14} className="text-yellow-400" />
                        Lvl {Math.floor(user.balance / 100) + 1}
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>

                <div className="flex flex-col gap-2 w-full mt-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-950 transition-colors text-zinc-400">
                        <CalendarDays size={18} />
                        <span className="text-sm">Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-white font-bold">Lifetime Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total Hours</span>
                  <span className="text-white font-bold">{totalHoursStudied.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Days Logged</span>
                  <span className="text-white font-bold">{totalDaysLogged}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Best Streak</span>
                  <span className="text-white font-bold">{user.bestStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total Balance</span>
                  <span className="text-emerald-400 font-bold">{user.balance} pts</span>
                </div>
              </div>
            </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3">
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <History size={20} className="text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-lg">Purchase History</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                {userPurchases.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 opacity-50">
                        <History size={48} strokeWidth={1} />
                        <p>No rewards redeemed yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                                <th className="p-4 font-medium">Reward</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {userPurchases.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-950/50 transition-colors group">
                                    <td className="p-4 text-white font-medium">{p.rewardName}</td>
                                    <td className="p-4">
                                        <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                            Redeemed
                                        </span>
                                    </td>
                                    <td className="p-4 text-zinc-400 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(p.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-rose-400 font-bold text-right font-mono">-{p.cost}</td>
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