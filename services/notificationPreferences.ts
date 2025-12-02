import { supabase } from './supabase';
import { NotificationPreferences } from '../types';

export interface NotificationPreferencesInput {
  enabled?: boolean;
  reminderTime?: string; // HH:MM format
  timezone?: string;
}

export const notificationPreferencesService = {
  // Get user's notification preferences
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      userId: data.user_id,
      enabled: data.enabled,
      reminderTime: data.reminder_time,
      timezone: data.timezone,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    };
  },

  // Create or update notification preferences
  async upsertPreferences(userId: string, prefs: NotificationPreferencesInput): Promise<NotificationPreferences> {
    // Get user's timezone if not provided
    const timezone = prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        enabled: prefs.enabled ?? false,
        reminder_time: prefs.reminderTime || '20:00:00',
        timezone: timezone,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      userId: data.user_id,
      enabled: data.enabled,
      reminderTime: data.reminder_time,
      timezone: data.timezone,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at
    };
  },

  // Enable notifications
  async enableNotifications(userId: string): Promise<NotificationPreferences> {
    return this.upsertPreferences(userId, { enabled: true });
  },

  // Disable notifications
  async disableNotifications(userId: string): Promise<NotificationPreferences> {
    return this.upsertPreferences(userId, { enabled: false });
  },

  // Update reminder time (preserves enabled state)
  async updateReminderTime(userId: string, reminderTime: string): Promise<NotificationPreferences> {
    // Get current preferences first to preserve enabled state
    const currentPrefs = await this.getPreferences(userId);
    
    return this.upsertPreferences(userId, {
      enabled: currentPrefs?.enabled ?? false,
      reminderTime: reminderTime,
      timezone: currentPrefs?.timezone
    });
  }
};

