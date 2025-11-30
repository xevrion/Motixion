import React from 'react';
import { useAppStore } from '../services/store';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip, XAxis, CartesianGrid, YAxis } from 'recharts';
import { ShieldCheck, Flame, Trophy, Calendar } from 'lucide-react';

export const FriendView: React.FC = () => {
  const { friend, logs } = useAppStore();

  const friendLogs = logs
    .filter(l => l.userId === friend.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const last7Days = friendLogs.slice(-7);
  const todayLog = friendLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
  const todayPoints = todayLog ? todayLog.score : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Friend Activity</h2>
        <p className="text-zinc-400 mt-1">Keep track of {friend.username}'s progress and stay accountable.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="space-y-6">
             <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1 mb-6 relative">
                    <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                    <div className="absolute bottom-0 right-0 bg-zinc-900 text-emerald-400 p-2 rounded-full border border-zinc-700 shadow-xl">
                        <ShieldCheck size={24} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{friend.username}</h2>
                <p className="text-zinc-500 text-sm mb-6">Accountability Partner</p>
                
                <div className="w-full grid grid-cols-2 gap-4">
                     <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Points Today</span>
                            <span className="text-2xl font-bold text-white">{todayPoints}</span>
                        </div>
                     </div>
                     <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Streak</span>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold text-white">{friend.currentStreak}</span>
                                <Flame size={16} className="text-orange-500" fill="currentColor" />
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                    <Trophy size={24} />
                </div>
                <div>
                    <p className="text-indigo-200 text-sm font-medium">Best Streak</p>
                    <p className="text-2xl font-bold text-white">{friend.bestStreak} days</p>
                </div>
            </div>
        </div>

        {/* Right Column: Detailed Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white font-bold text-lg">Weekly Performance</h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                <Calendar size={12} />
                Last 7 Days
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
             <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
               <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                  tickFormatter={(val) => val.slice(5)} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
               />
               <YAxis 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                {last7Days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" /> 
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};