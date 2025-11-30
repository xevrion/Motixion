import React from 'react';
import { useAppStore } from '../services/store';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, YAxis } from 'recharts';
import { Flame, TrendingUp, CheckCircle, Clock, Calendar, Edit3 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logs, loading } = useAppStore();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userLogs = logs
    .filter(l => l.userId === user.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const todayLog = userLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
  const last7Days = userLogs.slice(-7);

  // Stats for cards
  const todayPoints = todayLog ? todayLog.score : 0;
  const todayHours = todayLog ? todayLog.studyHours : 0;
  const tasksPercent = todayLog && todayLog.tasksAssigned > 0 
    ? Math.round((todayLog.tasksCompleted / todayLog.tasksAssigned) * 100) 
    : 0;

  const StatCard = ({ icon: Icon, label, value, unit, colorClass, subValue }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-zinc-950 ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-').replace('text-white', '')} />
        </div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className={`text-sm font-medium ${colorClass.replace('bg-', 'text-').replace('text-white', '')}`}>{unit}</span>}
      </div>
      {subValue && <p className="text-zinc-500 text-xs mt-2">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-sm sm:text-base text-zinc-400 mt-1">Welcome back, {user.username}. Here is your daily overview.</p>
      </div>

      {/* Header Stats - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={TrendingUp} 
            label="Points Today" 
            value={todayPoints} 
            unit="pts" 
            colorClass="text-emerald-400"
            subValue="Keep pushing!"
        />
        <StatCard 
            icon={Flame} 
            label="Current Streak" 
            value={user.currentStreak} 
            unit="days" 
            colorClass="text-orange-400"
            subValue={`Best: ${user.bestStreak} days`} 
        />
        <StatCard 
            icon={Clock} 
            label="Focus Time" 
            value={todayHours} 
            unit="hours" 
            colorClass="text-blue-400"
            subValue="Target: 6 hours" 
        />
        <StatCard 
            icon={CheckCircle} 
            label="Tasks Done" 
            value={tasksPercent} 
            unit="%" 
            colorClass="text-purple-400"
            subValue={`${todayLog?.tasksCompleted || 0}/${todayLog?.tasksAssigned || 0} completed`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Chart Section - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-3">
            <div>
                <h3 className="text-white font-bold text-base sm:text-lg">Activity History</h3>
                <p className="text-zinc-400 text-xs sm:text-sm">Points earned over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800 w-fit">
                <Calendar size={12} />
                Last 7 Days
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full">
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
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={50}>
                  {last7Days.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Section - Takes up 1 column */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col">
            <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Today's Breakdown</h3>
            
            {todayLog ? (
                <div className="space-y-4 flex-1">
                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-400 text-xs font-medium uppercase mb-1">Study Hours</p>
                            <p className="text-white font-mono text-lg">{todayLog.studyHours}h</p>
                        </div>
                        <span className="text-emerald-400 font-bold text-xl">+{todayLog.breakdown.study}</span>
                    </div>
                    
                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-400 text-xs font-medium uppercase mb-1">Tasks ({todayLog.tasksCompleted}/{todayLog.tasksAssigned})</p>
                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${tasksPercent}%` }}></div>
                            </div>
                        </div>
                        <span className={todayLog.breakdown.tasks >= 0 ? "text-emerald-400 font-bold text-xl" : "text-rose-400 font-bold text-xl"}>
                            {todayLog.breakdown.tasks > 0 ? '+' : ''}{todayLog.breakdown.tasks}
                        </span>
                    </div>

                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-400 text-xs font-medium uppercase mb-1">Wake Up</p>
                            <p className="text-white font-mono text-lg">{todayLog.wakeTime}</p>
                        </div>
                        <span className="text-emerald-400 font-bold text-xl">+{todayLog.breakdown.wake}</span>
                    </div>

                    {todayLog.breakdown.waste < 0 && (
                        <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 flex justify-between items-center">
                            <div>
                                <p className="text-rose-400/70 text-xs font-medium uppercase mb-1">Wasted Time</p>
                                <p className="text-rose-200 font-mono text-lg">{todayLog.wastedHours}h</p>
                            </div>
                            <span className="text-rose-400 font-bold text-xl">{todayLog.breakdown.waste}</span>
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-400 font-medium">Net Score</span>
                        <span className="text-4xl font-bold text-white">{todayLog.score}</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Edit3 size={24} className="opacity-50" />
                    </div>
                    <p>No activity logged yet today.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};