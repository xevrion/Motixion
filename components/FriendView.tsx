import React, { useState, useEffect } from "react";
import { useAppStore } from "../services/store";
import { friendService } from "../services/friends";
import { Avatar } from "./Avatar";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
  Tooltip,
  XAxis,
  CartesianGrid,
  YAxis,
} from "recharts";
import {
  Trophy,
  Flame,
  TrendingUp,
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Medal,
  Crown,
  Award,
  Eye,
  Calendar,
} from "lucide-react";
import { getToday } from "../services/dateUtils";

export const FriendView: React.FC = () => {
  const { user, logs, loading } = useAppStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [friendLogs, setFriendLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [leaderboardView, setLeaderboardView] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriend && !leaderboardView) {
      loadFriendLogs();
    }
  }, [selectedFriend, leaderboardView]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const data = await friendService.getFriendsWithTodayData(user.id);
      setFriends(data);
      setLoadingFriends(false);
    } catch (error) {
      console.error("Error loading friends:", error);
      setLoadingFriends(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    try {
      const data = await friendService.getFriendRequests(user.id);
      setFriendRequests(data);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  const loadFriendLogs = async () => {
    if (!selectedFriend) return;
    try {
      const data = await friendService.getFriendLogs(selectedFriend.id, 30);
      setFriendLogs(data);
    } catch (error) {
      console.error("Error loading friend logs:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await friendService.searchUsers(searchQuery);
      setSearchResults(results.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user) return;
    try {
      await friendService.sendFriendRequest(user.id, friendId);
      alert("Friend request sent!");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error: any) {
      alert(error.message || "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await friendService.acceptFriendRequest(friendshipId);
      await loadFriends();
      await loadFriendRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await friendService.rejectFriendRequest(friendshipId);
      await loadFriendRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const viewFriendDetails = (friend: any) => {
    setSelectedFriend(friend);
    setLeaderboardView(false);
  };

  if (loading || loadingFriends || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading friends...</p>
        </div>
      </div>
    );
  }

  // No friends view
  if (friends.length === 0) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Friends
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Search and add friends to compete on the leaderboard.
          </p>
        </div>

        {friendRequests.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 rounded-2xl">
            <h3 className="text-zinc-900 dark:text-white font-bold mb-4 text-base sm:text-lg">
              Pending Requests
            </h3>

            <div className="space-y-3">
              {friendRequests.map((request) => {
                const requester =
                  request.user_id === user.id ? request.friend : request.user;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-950 p-3 sm:p-4 rounded-xl gap-2"
                  >
                    <span className="text-zinc-900 dark:text-white text-sm sm:text-base truncate">
                      {requester.username}
                    </span>
                    {request.friend_id === user.id && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-400"
                        >
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

        <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl">
          <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg mb-4">
            Search for Friends
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by username..."
              className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleSearch}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Search size={18} />
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-zinc-900 dark:text-white font-medium text-sm sm:text-base truncate">
                      {result.username}
                    </p>
                    {/* <p className="text-zinc-500 text-xs sm:text-sm truncate">{result.email}</p> */}
                  </div>
                  <button
                    onClick={() => handleSendRequest(result.id)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm flex-shrink-0"
                  >
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

  // Detailed friend view
  if (!leaderboardView && selectedFriend) {
    const last7Days = friendLogs.slice(-7).map((log) => ({
      date: log.date,
      score: log.total_points,
    }));
    const todayLog = friendLogs.find((l) => l.date === getToday());
    const todayPoints = todayLog ? todayLog.total_points : 0;
    const totalDaysLogged = friendLogs.length;
    const totalHoursStudied = friendLogs.reduce(
      (sum, log) => sum + log.study_hours,
      0
    );
    const averageDailyScore =
      totalDaysLogged > 0
        ? Math.round(
            friendLogs.reduce((sum, log) => sum + log.total_points, 0) /
              totalDaysLogged
          )
        : 0;
    const todayTasksPercent =
      todayLog && todayLog.tasks_assigned > 0
        ? Math.round((todayLog.tasks_completed / todayLog.tasks_assigned) * 100)
        : 0;

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLeaderboardView(true)}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm sm:text-base"
          >
            <Trophy size={20} />← Back to Leaderboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Profile */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6 relative">
                <Avatar
                  avatarUrl={selectedFriend.avatar_url}
                  username={selectedFriend.username}
                  size='lg'
                  showBorder={true}
                  borderColor="border-emerald-500"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                {selectedFriend.username}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mb-6">
                Accountability Partner
              </p>

              <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-300 dark:border-zinc-800">
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-600 dark:text-zinc-500 text-xs font-bold uppercase mb-1">
                      Today
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                      {todayPoints}
                    </span>
                  </div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-300 dark:border-zinc-800">
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-600 dark:text-zinc-500 text-xs font-bold uppercase mb-1">
                      Streak
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                        {selectedFriend.current_streak || 0}
                      </span>
                      <Flame
                        size={14}
                        className="text-orange-500"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-300 dark:border-zinc-800">
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-600 dark:text-zinc-500 text-xs font-bold uppercase mb-1">
                      Balance
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                      {selectedFriend.balance || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-300 dark:border-zinc-800">
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-600 dark:text-zinc-500 text-xs font-bold uppercase mb-1">
                      Tasks
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                      {todayTasksPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifetime Stats */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 rounded-2xl">
              <h3 className="text-zinc-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Trophy size={18} className="text-yellow-400" />
                Lifetime Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Total Hours
                  </span>
                  <span className="text-zinc-900 dark:text-white font-bold">
                    {totalHoursStudied.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Days Logged
                  </span>
                  <span className="text-zinc-900 dark:text-white font-bold">
                    {totalDaysLogged}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Avg Daily Score
                  </span>
                  <span className="text-zinc-900 dark:text-white font-bold">
                    {averageDailyScore} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Best Streak
                  </span>
                  <span className="text-zinc-900 dark:text-white font-bold">
                    {selectedFriend.best_streak || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-3">
              <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg">
                Weekly Performance
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 w-fit">
                <Calendar size={12} />
                Last 7 Days
              </div>
            </div>

            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={last7Days}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#27272a"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    tickFormatter={(val) => val.slice(5)}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#27272a" }}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
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
  }

  // Leaderboard view
  const myTodayLog = logs.find(
    (l) => l.date === getToday() && l.userId === user.id
  );
  const myTodayPoints = myTodayLog ? myTodayLog.score : 0;

  // Create leaderboard with user + friends
  const leaderboard = [
    {
      id: user.id,
      username: user.username + " (You)",
      balance: user.balance,
      current_streak: user.currentStreak,
      todayPoints: myTodayPoints,
      isMe: true,
    },
    ...friends.map((f) => ({ ...f, isMe: false })),
  ].sort((a, b) => b.todayPoints - a.todayPoints);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Crown className="text-yellow-400" size={24} fill="currentColor" />
        );
      case 2:
        return <Medal className="text-zinc-300" size={24} />;
      case 3:
        return <Medal className="text-orange-400" size={24} />;
      default:
        return <div className="text-zinc-500 font-bold text-lg">#{rank}</div>;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Trophy className="text-yellow-400" size={32} />
            Leaderboard
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Today's rankings • {friends.length + 1} competitors
          </p>
        </div>

        <button
          onClick={loadFriends}
          className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors w-fit"
        >
          <TrendingUp size={16} />
          Refresh
        </button>
      </div>

      {/* Pending Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 sm:p-6 rounded-2xl">
          <h3 className="text-blue-600 dark:text-blue-400 font-bold mb-4 text-base sm:text-lg flex items-center gap-2">
            <UserPlus size={20} />
            Pending Friend Requests ({friendRequests.length})
          </h3>
          <div className="space-y-3">
            {friendRequests.map((request) => {
              const requester =
                request.user_id === user.id ? request.friend : request.user;
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50 p-3 sm:p-4 rounded-xl gap-2"
                >
                  <span className="text-white text-sm sm:text-base truncate">
                    {requester.username}
                  </span>
                  {request.friend_id === user.id && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-400 transition-colors"
                      >
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

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-6 transition-all duration-200 ${
              entry.isMe
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
            } ${
              !entry.isMe
                ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                : ""
            }`}
            onClick={() => !entry.isMe && viewFriendDetails(entry)}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 sm:w-16 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <Avatar
                avatarUrl={entry.avatar_url ?? entry.avatarUrl}
                username={entry.username}
                size="lg"
                showBorder={index < 3 || entry.isMe}
                borderColor={
                  entry.isMe
                    ? "border-emerald-500"
                    : index === 0
                    ? "border-yellow-500"
                    : index === 1
                    ? "border-zinc-300"
                    : index === 2
                    ? "border-orange-500"
                    : "border-emerald-500"
                }
                className={
                  entry.isMe
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600"
                    : index === 0
                    ? "bg-yellow-500/20 text-yellow-600"
                    : index === 1
                    ? "bg-zinc-300/20 text-zinc-500"
                    : index === 2
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg truncate">
                  {entry.username}
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 mt-1 flex-wrap">
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Flame
                      size={14}
                      className="text-orange-400"
                      fill="currentColor"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {entry.current_streak} day streak
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Award size={14} className="text-blue-400" />
                    <span className="text-zinc-400 dark:text-zinc-400">
                      {entry.balance} total pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Points */}
              <div className="flex-shrink-0 text-right">
                <div className="text-xs sm:text-sm text-zinc-500 font-medium mb-1">
                  Today
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    entry.todayPoints > 0
                      ? "text-emerald-500"
                      : "text-zinc-600 dark:text-zinc-500"
                  }`}
                >
                  {entry.todayPoints}
                </div>
                <div className="text-xs text-zinc-500">pts</div>
              </div>

              {/* View button for friends */}
              {!entry.isMe && (
                <div className="hidden sm:flex flex-shrink-0">
                  <Eye size={20} className="text-zinc-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Friends Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 rounded-2xl">
        <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
          <Users size={20} />
          Add More Friends
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by username"
            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleSearch}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Search size={18} />
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3 mt-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl gap-3"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm sm:text-base truncate">
                    {result.username}
                  </p>
                </div>
                <button
                  onClick={() => handleSendRequest(result.id)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm flex-shrink-0"
                >
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
};
