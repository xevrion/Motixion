import { supabase } from './supabase';
import { calculatePoints } from './pointLogic';

export interface DailyLogInput {
  date: string;
  wakeTime: string;
  studyHours: number;
  breakHours: number;
  wastedHours: number;
  tasksAssigned: number;
  tasksCompleted: number;
  notes?: string;
}

export const dailyLogService = {
  // Create or update a daily log
  async saveDailyLog(userId: string, logData: DailyLogInput) {
    // Check if there's an existing log for today
    const existingLog = await this.getTodayLog(userId);
    const oldPoints = existingLog ? existingLog.total_points : 0;
    const isNewLog = !existingLog; // Track if this is a new log

    // Calculate points using the existing logic
    const { total, breakdown } = calculatePoints({
      studyHours: logData.studyHours,
      wastedHours: logData.wastedHours,
      wakeTime: logData.wakeTime,
      tasksAssigned: logData.tasksAssigned,
      tasksCompleted: logData.tasksCompleted
    });

    const logRecord = {
      user_id: userId,
      date: logData.date,
      wake_time: logData.wakeTime,
      study_hours: logData.studyHours,
      break_hours: logData.breakHours,
      wasted_time: logData.wastedHours,
      tasks_assigned: logData.tasksAssigned,
      tasks_completed: logData.tasksCompleted,
      extra_tasks: 0,
      notes: logData.notes || '',
      task_score: breakdown.tasks,
      hour_score: breakdown.study,
      wake_score: breakdown.wake,
      penalties: Math.abs(breakdown.waste),
      total_points: total
    };

    // Upsert the log (insert or update if exists for this date)
    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(logRecord, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw error;

    // Update user balance: subtract old points, add new points
    const pointsDelta = total - oldPoints;
    await this.updateUserPoints(userId, pointsDelta);

    // Update streak ONLY if this is a NEW log (not an edit)
    if (isNewLog) {
      await this.updateStreak(userId, total);
    }

    return data;
  },

  // Get user's daily logs
  async getUserLogs(userId: string, limit?: number) {
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get today's log
  async getTodayLog(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get logs for a specific date range
  async getLogsByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Update user's balance
  async updateUserPoints(userId: string, pointsToAdd: number) {
    // Get current balance
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: (user.balance || 0) + pointsToAdd })
      .eq('id', userId);

    if (updateError) throw updateError;
  },

  // Update streak
  async updateStreak(userId: string, points: number) {
    const { data: streak, error: fetchError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let newStreak = 0;
    let newBestStreak = 0;

    if (points > 0) {
      // Increment streak
      newStreak = (streak?.current_streak || 0) + 1;
      newBestStreak = Math.max(newStreak, streak?.best_streak || 0);
    } else {
      // Reset streak
      newStreak = 0;
      newBestStreak = streak?.best_streak || 0;
    }

    // Upsert streak
    const { error: upsertError } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        best_streak: newBestStreak,
        wake_streak: streak?.wake_streak || 0,
        task_streak: streak?.task_streak || 0,
        study_streak: streak?.study_streak || 0
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) throw upsertError;

    // Also update users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_streak: newStreak,
        best_streak: newBestStreak
      })
      .eq('id', userId);

    if (updateError) throw updateError;
  }
};
