import React, { useState, useMemo } from 'react';
import { useAppStore } from '../services/store';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, YAxis } from 'recharts';
import { Flame, TrendingUp, CheckCircle, Clock, Calendar, Edit3, FileText } from 'lucide-react';
import { getToday } from '../services/dateUtils';

export const Dashboard: React.FC = () => {
  const { user, logs, loading } = useAppStore();
  const [visibleNotesCount, setVisibleNotesCount] = useState(15);

  // Filter and sort user logs - must be computed before early return
  const userLogs = useMemo(() => {
    if (!user) return [];
    return logs
      .filter(l => l.userId === user.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, user]);

  // Filter and sort logs with notes
  const logsWithNotes = useMemo(() => {
    return userLogs
      .filter(log => log.notes && log.notes.trim().length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userLogs]);

  // Get visible notes based on pagination
  const visibleNotes = logsWithNotes.slice(0, visibleNotesCount);
  const hasMoreNotes = logsWithNotes.length > visibleNotesCount;

  const handleLoadMore = () => {
    setVisibleNotesCount(prev => prev + 15);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayLog = userLogs.find(l => l.date === getToday());
  const last7Days = userLogs.slice(-7);

  const todayPoints = todayLog ? todayLog.score : 0;
  const todayHours = todayLog ? todayLog.studyHours : 0;
  const tasksPercent = todayLog && todayLog.tasksAssigned > 0 
    ? Math.round((todayLog.tasksCompleted / todayLog.tasksAssigned) * 100) 
    : 0;

  const StatCard = ({ icon: Icon, label, value, unit, colorClass, subValue }: any) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-950 ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</span>
        {unit && <span className={`text-sm font-medium ${colorClass.replace('bg-', 'text-')}`}>{unit}</span>}
      </div>
      {subValue && <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-2">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Dashboard</h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">Welcome back, {user.username}. Here is your daily overview.</p>
      </div>

      {/* Header Stats */}
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
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-3">
            <div>
                <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg">Activity History</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">Points earned over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 w-fit">
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
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={50}>
                  {last7Days.map((entry, index) => (
                    <Cell key={index} fill={entry.score > 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col">
            <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Today's Breakdown</h3>
            
            {todayLog ? (
                <div className="space-y-4 flex-1">

                    <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 flex justify-between items-center group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase mb-1">Study Hours</p>
                            <p className="text-zinc-900 dark:text-white font-mono text-lg">{todayLog.studyHours}h</p>
                        </div>
                        <span className="text-emerald-400 font-bold text-xl">+{todayLog.breakdown.study}</span>
                    </div>

                    <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 flex justify-between items-center group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase mb-1">Tasks ({todayLog.tasksCompleted}/{todayLog.tasksAssigned})</p>
                            <div className="w-24 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${tasksPercent}%` }}></div>
                            </div>
                        </div>
                        <span className={todayLog.breakdown.tasks >= 0 ? "text-emerald-400 font-bold text-xl" : "text-rose-400 font-bold text-xl"}>
                            {todayLog.breakdown.tasks > 0 ? '+' : ''}{todayLog.breakdown.tasks}
                        </span>
                    </div>

                    <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-300/50 dark:border-zinc-800/50 flex justify-between items-center group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                        <div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase mb-1">Wake Up</p>
                            <p className="text-zinc-900 dark:text-white font-mono text-lg">{todayLog.wakeTime}</p>
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

                    <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium">Net Score</span>
                        <span className="text-4xl font-bold text-zinc-900 dark:text-white">{todayLog.score}</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 dark:text-zinc-500">
                    <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Edit3 size={24} className="opacity-50" />
                    </div>
                    <p>No activity logged yet today.</p>
                </div>
            )}
        </div>
      </div>

      {/* Notes Section */}
      {logsWithNotes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800">
              <FileText size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg">Your Notes</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                {logsWithNotes.length} {logsWithNotes.length === 1 ? 'note' : 'notes'} total
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {visibleNotes.map((log) => {
              const noteDate = new Date(log.date);
              const formattedDate = noteDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Calendar size={14} />
                      <span className="text-sm font-medium">{formattedDate}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {log.studyHours}h
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-purple-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {log.tasksCompleted}/{log.tasksAssigned}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {log.score} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-900 dark:text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {log.notes}
                  </p>
                </div>
              );
            })}
          </div>

          {hasMoreNotes && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium text-sm transition-colors border border-zinc-300 dark:border-zinc-700"
              >
                Load More ({logsWithNotes.length - visibleNotesCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
