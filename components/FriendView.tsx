import React, { useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { friendService } from '../services/friends';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip, XAxis, CartesianGrid, YAxis } from 'recharts';
import { ShieldCheck, Flame, Trophy, Calendar, UserPlus, Search, Check, X } from 'lucide-react';
import { User } from '../types';

export const FriendView: React.FC = () => {
  const { user, logs, loading } = useAppStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [friendLogs, setFriendLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriend) {
      loadFriendLogs();
    }
  }, [selectedFriend]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const data = await friendService.getFriends(user.id);
      setFriends(data);
      if (data.length > 0 && !selectedFriend) {
        setSelectedFriend(data[0]);
      }
      setLoadingFriends(false);
    } catch (error) {
      console.error('Error loading friends:', error);
      setLoadingFriends(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    try {
      const data = await friendService.getFriendRequests(user.id);
      setFriendRequests(data);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadFriendLogs = async () => {
    if (!selectedFriend) return;
    try {
      const data = await friendService.getFriendLogs(selectedFriend.id, 30);
      setFriendLogs(data);
    } catch (error) {
      console.error('Error loading friend logs:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await friendService.searchUsers(searchQuery);
      setSearchResults(results.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user) return;
    try {
      await friendService.sendFriendRequest(user.id, friendId);
      alert('Friend request sent!');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      alert(error.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await friendService.acceptFriendRequest(friendshipId);
      await loadFriends();
      await loadFriendRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await friendService.rejectFriendRequest(friendshipId);
      await loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading || loadingFriends || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading friends...</p>
        </div>
      </div>
    );
  }

  if (!selectedFriend && friends.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Friends</h2>
          <p className="text-zinc-400 mt-1">Search and add friends to stay accountable together.</p>
        </div>

        {friendRequests.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-4">Pending Requests</h3>
            <div className="space-y-3">
              {friendRequests.map((request) => {
                const requester = request.user_id === user.id ? request.friend : request.user;
                return (
                  <div key={request.id} className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl">
                    <span className="text-white">{requester.username}</span>
                    {request.friend_id === user.id && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptRequest(request.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleRejectRequest(request.id)} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-400">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <h3 className="text-white font-bold text-lg mb-4">Search for Friends</h3>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username or email..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 rounded-xl flex items-center gap-2">
              <Search size={20} />
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{result.username}</p>
                    <p className="text-zinc-500 text-sm">{result.email}</p>
                  </div>
                  <button onClick={() => handleSendRequest(result.id)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                    <UserPlus size={16} />
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const last7Days = friendLogs.slice(-7).map(log => ({
    date: log.date,
    score: log.total_points
  }));
  const todayLog = friendLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
  const todayPoints = todayLog ? todayLog.total_points : 0;

  // Calculate detailed stats
  const totalDaysLogged = friendLogs.length;
  const totalHoursStudied = friendLogs.reduce((sum, log) => sum + log.study_hours, 0);
  const averageDailyScore = totalDaysLogged > 0 ? Math.round(friendLogs.reduce((sum, log) => sum + log.total_points, 0) / totalDaysLogged) : 0;
  const todayTasksPercent = todayLog && todayLog.tasks_assigned > 0
    ? Math.round((todayLog.tasks_completed / todayLog.tasks_assigned) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Friend Activity</h2>
          <p className="text-zinc-400 mt-1">Keep track of {selectedFriend.username}'s progress and stay accountable.</p>
        </div>

        {/* Quick Comparison Badge */}
        {user && (
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl">
            <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Today's Race</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-zinc-500">You</p>
                <p className="text-xl font-bold text-emerald-400">
                  {logs.find(l => l.date === new Date().toISOString().split('T')[0] && l.userId === user.id)?.score || 0}
                </p>
              </div>
              <div className="text-zinc-600 font-bold text-2xl">vs</div>
              <div className="text-center">
                <p className="text-xs text-zinc-500">Them</p>
                <p className="text-xl font-bold text-blue-400">{todayPoints}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Profile Card & Quick Stats */}
        <div className="space-y-6">
             <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1 mb-6 relative">
                    <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-emerald-500">
                      {selectedFriend.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-zinc-900 text-emerald-400 p-2 rounded-full border border-zinc-700 shadow-xl">
                        <ShieldCheck size={24} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedFriend.username}</h2>
                <p className="text-zinc-500 text-sm mb-6">Accountability Partner</p>

                <div className="w-full grid grid-cols-2 gap-3">
                     <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Today's Points</span>
                            <span className="text-2xl font-bold text-emerald-400">{todayPoints}</span>
                        </div>
                     </div>
                     <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Streak</span>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold text-orange-400">{selectedFriend.current_streak || 0}</span>
                                <Flame size={16} className="text-orange-500" fill="currentColor" />
                            </div>
                        </div>
                     </div>
                     <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Balance</span>
                            <span className="text-2xl font-bold text-blue-400">{selectedFriend.balance || 0}</span>
                        </div>
                     </div>
                     <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-500 text-xs font-bold uppercase mb-1">Tasks Today</span>
                            <span className="text-2xl font-bold text-purple-400">{todayTasksPercent}%</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Lifetime Stats Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-400" />
                    Lifetime Stats
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Total Hours Studied</span>
                        <span className="text-white font-bold">{totalHoursStudied.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Days Logged</span>
                        <span className="text-white font-bold">{totalDaysLogged}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Avg Daily Score</span>
                        <span className="text-white font-bold">{averageDailyScore} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Best Streak</span>
                        <span className="text-white font-bold">{selectedFriend.best_streak || 0} days</span>
                    </div>
                </div>
            </div>

            {/* Today's Details Card */}
            {todayLog && (
                <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/20 p-6 rounded-2xl">
                    <h3 className="text-emerald-200 font-bold mb-4 text-sm">Today's Activity</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-300/70 text-xs">Wake Time</span>
                            <span className="text-emerald-100 font-mono text-sm">{todayLog.wake_time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-300/70 text-xs">Study Hours</span>
                            <span className="text-emerald-100 font-mono text-sm">{todayLog.study_hours}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-300/70 text-xs">Tasks Done</span>
                            <span className="text-emerald-100 font-mono text-sm">{todayLog.tasks_completed}/{todayLog.tasks_assigned}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-300/70 text-xs">Wasted Time</span>
                            <span className="text-rose-300 font-mono text-sm">{todayLog.wasted_time}h</span>
                        </div>
                    </div>
                </div>
            )}
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