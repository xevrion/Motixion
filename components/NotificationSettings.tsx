import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../services/notifications';
import { notificationPreferencesService } from '../services/notificationPreferences';
import { NotificationPreferences } from '../types';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [vapidKeyConfigured, setVapidKeyConfigured] = useState(false);

  const [reminderTime, setReminderTime] = useState('20:00');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkSupport();
  }, [userId]);

  const checkSupport = () => {
    const supported = notificationService.isSupported();
    setIsSupported(supported);
    if (supported) setPermissionStatus(notificationService.getPermission());

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const keyConfigured = !!vapidKey && vapidKey.trim().length > 0;
    setVapidKeyConfigured(keyConfigured);

    if (!keyConfigured) {
      setError(
        'VAPID key not configured. Please add VITE_VAPID_PUBLIC_KEY to your Vercel environment variables and redeploy.'
      );
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const prefs = await notificationPreferencesService.getPreferences(userId);

      if (prefs) {
        setPreferences(prefs);
        setEnabled(prefs.enabled);
        setReminderTime(prefs.reminderTime.substring(0, 5));
      } else {
        const defaultPrefs = await notificationPreferencesService.upsertPreferences(userId, {
          enabled: false,
          reminderTime: '20:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        setPreferences(defaultPrefs);
        setEnabled(defaultPrefs.enabled);
        setReminderTime(defaultPrefs.reminderTime.substring(0, 5));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        setError('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      await notificationService.subscribeToPush(userId);
      const updatedPrefs = await notificationPreferencesService.enableNotifications(userId);

      setPreferences(updatedPrefs);
      setEnabled(updatedPrefs.enabled);
      setSuccess('Notifications enabled successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications');
      await loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await notificationService.unsubscribeFromPush(userId);
      const updatedPrefs = await notificationPreferencesService.disableNotifications(userId);

      setPreferences(updatedPrefs);
      setEnabled(updatedPrefs.enabled);
      setSuccess('Notifications disabled successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to disable notifications');
      await loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setReminderTime(newTime);

    try {
      const updatedPrefs = await notificationPreferencesService.updateReminderTime(
        userId,
        `${newTime}:00`
      );

      setPreferences(updatedPrefs);
      setReminderTime(updatedPrefs.reminderTime.substring(0, 5));
      setEnabled(updatedPrefs.enabled);

      setSuccess('Reminder time updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder time');
      if (preferences) setReminderTime(preferences.reminderTime.substring(0, 5));
    }
  };

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  /* BROWSER NOT SUPPORTED */
  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">
              Push Notifications Not Supported
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Your browser doesn't support push notifications. Try Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* MISSING VAPID KEY */
  if (!vapidKeyConfigured) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Configuration Required</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
              VAPID key is missing. Push notifications cannot work.
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 p-3 rounded-lg text-xs font-mono text-zinc-800 dark:text-zinc-300">
              <p className="mb-1">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Vercel Dashboard → Project → Settings → Environment Variables</li>
                <li>Add <code className="bg-zinc-200 dark:bg-zinc-900 px-1 rounded">VITE_VAPID_PUBLIC_KEY</code></li>
                <li>Paste your VAPID public key</li>
                <li>Redeploy</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* MAIN SETTINGS UI */
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Bell className="text-emerald-500" size={20} />
        </div>
        <div>
          <h3 className="text-zinc-900 dark:text-white font-bold text-base sm:text-lg">
            Daily Reminders
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
            Get notified to log your daily activity
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm p-3 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* TOGGLE */}
      <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="text-emerald-500" size={20} />
          ) : (
            <BellOff className="text-zinc-500 dark:text-zinc-400" size={20} />
          )}
          <div>
            <p className="text-zinc-900 dark:text-white font-medium text-sm sm:text-base">
              {enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              {permissionStatus === 'granted'
                ? 'Permission granted'
                : permissionStatus === 'denied'
                ? 'Permission denied in browser settings'
                : 'Click to enable notifications'}
            </p>
          </div>
        </div>

        <button
          onClick={enabled ? handleDisableNotifications : handleEnableNotifications}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
            enabled
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? 'Saving...' : enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* TIME PICKER */}
      {enabled && (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-300 dark:border-zinc-800">
          <label className="flex items-center gap-3 mb-3">
            <Clock className="text-blue-500 dark:text-blue-400" size={18} />
            <span className="text-zinc-900 dark:text-white font-medium text-sm sm:text-base">
              Reminder Time
            </span>
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm sm:text-base"
          />
          <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2">
            You’ll receive a reminder at this time each day.
          </p>
        </div>
      )}
    </div>
  );
};
