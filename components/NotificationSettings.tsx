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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const checkSupport = () => {
    const supported = notificationService.isSupported();
    setIsSupported(supported);
    if (supported) {
      setPermissionStatus(notificationService.getPermission());
    }
    
    // Check if VAPID key is configured (check in env)
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const keyConfigured = !!vapidKey && vapidKey.trim().length > 0;
    setVapidKeyConfigured(keyConfigured);
    
    if (!keyConfigured) {
      setError('VAPID key not configured. Please add VITE_VAPID_PUBLIC_KEY to your Vercel environment variables and redeploy.');
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      // Clear any previous errors/success messages
      setError('');
      setSuccess('');
      
      const prefs = await notificationPreferencesService.getPreferences(userId);
      
      if (prefs) {
        setPreferences(prefs);
        setEnabled(prefs.enabled);
        // Convert HH:MM:SS to HH:MM for input
        setReminderTime(prefs.reminderTime.substring(0, 5));
      } else {
        // Create default preferences only if they don't exist
        // Don't overwrite if they were just created during enable
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

      // Request permission first
      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        setError('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      // Subscribe to push notifications
      await notificationService.subscribeToPush(userId);

      // Enable in preferences (update database)
      const updatedPrefs = await notificationPreferencesService.enableNotifications(userId);
      
      // Update state from database response to ensure sync
      setPreferences(updatedPrefs);
      setEnabled(updatedPrefs.enabled);
      setSuccess('Notifications enabled successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications');
      // Reload preferences from database to get actual state
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

      // Unsubscribe from push
      await notificationService.unsubscribeFromPush(userId);

      // Disable in preferences (update database)
      const updatedPrefs = await notificationPreferencesService.disableNotifications(userId);
      
      // Update state from database response to ensure sync
      setPreferences(updatedPrefs);
      setEnabled(updatedPrefs.enabled);
      setSuccess('Notifications disabled successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Failed to disable notifications');
      // Reload preferences from database to get actual state
      await loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setReminderTime(newTime);
    
    try {
      // Update reminder time (this preserves the enabled state)
      const updatedPrefs = await notificationPreferencesService.updateReminderTime(userId, `${newTime}:00`);
      
      // Update state from database response to ensure sync
      setPreferences(updatedPrefs);
      setReminderTime(updatedPrefs.reminderTime.substring(0, 5));
      // Preserve enabled state
      setEnabled(updatedPrefs.enabled);
      
      setSuccess('Reminder time updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder time');
      // Revert time change on error
      if (preferences) {
        setReminderTime(preferences.reminderTime.substring(0, 5));
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-10 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-white font-bold mb-1">Push Notifications Not Supported</h3>
            <p className="text-zinc-400 text-sm">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!vapidKeyConfigured) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-white font-bold mb-1">Configuration Required</h3>
            <p className="text-zinc-400 text-sm mb-2">
              VAPID key is not configured. Push notifications cannot work without it.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-xs font-mono text-zinc-300">
              <p className="mb-1">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add: <code className="bg-zinc-900 px-1 rounded">VITE_VAPID_PUBLIC_KEY</code></li>
                <li>Value: Your VAPID public key</li>
                <li>Redeploy your project</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Bell className="text-emerald-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">Daily Reminders</h3>
            <p className="text-zinc-400 text-xs sm:text-sm">Get notified to log your daily activity</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">{error}</p>
            {!vapidKeyConfigured && (
              <div className="mt-2 text-xs bg-red-500/5 p-2 rounded border border-red-500/10">
                <p className="mb-1">The VAPID key is missing. Here's what to do:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 text-red-300">
                  <li>Go to <strong>Vercel Dashboard</strong> → Your Project → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                  <li>Add: <code className="bg-red-500/10 px-1 rounded">VITE_VAPID_PUBLIC_KEY</code></li>
                  <li>Set value to: <code className="bg-red-500/10 px-1 rounded break-all">BFwp_a7Ff4uG3crsEAgdo2o6C3oZ2lP2PbaWnjRelFvvG8rVK_DXVj9Xn9BMre8-TpmFDXVKR6k8CUB9Pb-yNiI</code></li>
                  <li><strong>Select all environments</strong> (Production, Preview, Development)</li>
                  <li><strong>Redeploy</strong> your project (very important!)</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="text-emerald-400" size={20} />
          ) : (
            <BellOff className="text-zinc-500" size={20} />
          )}
          <div>
            <p className="text-white font-medium text-sm sm:text-base">
              {enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
            </p>
            <p className="text-zinc-400 text-xs">
              {permissionStatus === 'granted' 
                ? 'Permission granted' 
                : permissionStatus === 'denied'
                ? 'Permission denied - check browser settings'
                : 'Click to enable notifications'}
            </p>
          </div>
        </div>
        <button
          onClick={enabled ? handleDisableNotifications : handleEnableNotifications}
          disabled={saving}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
            enabled
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? 'Saving...' : enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Reminder Time */}
      {enabled && (
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <label className="flex items-center gap-3 mb-3">
            <Clock className="text-blue-400" size={18} />
            <span className="text-white font-medium text-sm sm:text-base">Reminder Time</span>
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm sm:text-base"
          />
          <p className="text-zinc-500 text-xs mt-2">
            You'll receive a reminder at this time each day if you haven't logged your activity yet.
          </p>
        </div>
      )}
    </div>
  );
};

