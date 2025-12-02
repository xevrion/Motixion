// Supabase Edge Function: Send Daily Reminders
// This function is triggered by a cron job to send push notifications to users
// who haven't logged their activity yet today

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL') || 'noreply@motixion.vercel.app';

interface PushSubscription {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

// Get today's date in a specific timezone, accounting for 5 AM cutoff
// This matches the client-side getToday() logic which uses local time
function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  
  // Get current date/time components in user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  
  // If before 5 AM local time, use yesterday's date
  let userDate = new Date(`${year}-${month}-${day}T00:00:00`);
  if (hour < 5) {
    userDate.setDate(userDate.getDate() - 1);
  }
  
  // Format as YYYY-MM-DD
  const finalYear = userDate.getFullYear();
  const finalMonth = String(userDate.getMonth() + 1).padStart(2, '0');
  const finalDay = String(userDate.getDate()).padStart(2, '0');
  
  return `${finalYear}-${finalMonth}-${finalDay}`;
}

// Check if current time in user's timezone matches reminder time
// Since cron runs every hour at :00, we check if the reminder hour matches the current hour
// This ensures reminders are sent during the hour they're scheduled for
function isReminderTime(reminderTime: string, userTimezone: string): boolean {
  const now = new Date();
  
  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  
  // Parse reminder time (format: HH:MM:SS or HH:MM)
  const timeParts = reminderTime.split(':');
  const reminderHour = parseInt(timeParts[0] || '20');
  const reminderMinute = parseInt(timeParts[1] || '0');
  
  // Since cron runs every hour at :00, we send notifications if:
  // 1. Current hour matches reminder hour (e.g., reminder at 8:30, cron runs at 8:00)
  // 2. We're at the start of the hour (minute < 5) to catch reminders scheduled for this hour
  // This ensures reminders are sent during the hour window they're scheduled for
  
  if (reminderHour === currentHour) {
    // If we're at the start of the hour (cron just ran), send for any minute in this hour
    // If we're later in the hour, only send if reminder minute has passed
    if (currentMinute < 5) {
      return true; // Cron just ran, send for this hour
    }
    // Otherwise, only send if reminder minute has already passed (with small buffer)
    return reminderMinute <= currentMinute + 5;
  }
  
  return false;
}

serve(async (req) => {
  try {
    // Only allow POST requests (for cron triggers)
    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Get Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const currentUTCMinute = now.getUTCMinutes();

    // Validate VAPID keys are set
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as Edge Function secrets.',
          hint: 'Run: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=...'
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Find users with enabled notifications
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      throw prefError;
    }

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with enabled notifications', sent: 0 }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Fetch user data separately for usernames
    const userIds = preferences.map(p => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      // Continue without usernames - not critical
    }

    // Create a map for quick username lookup
    const userMap = new Map();
    if (users) {
      users.forEach(user => {
        userMap.set(user.id, user.username);
      });
    }

    const notificationsSent = [];
    const errors = [];
    const skipped = [];

    console.log(`Processing ${preferences.length} users with enabled notifications`);

    for (const pref of preferences) {
      try {
        // Get user's timezone (default to UTC if not set)
        const userTimezone = pref.timezone || 'UTC';
        
        // Check if it's time for this user's reminder (in their timezone)
        if (!isReminderTime(pref.reminder_time, userTimezone)) {
          skipped.push({
            userId: pref.user_id,
            reason: `Not reminder time (current timezone: ${userTimezone}, reminder: ${pref.reminder_time})`
          });
          continue;
        }
        
        // Get today's date in user's timezone (matching client-side logic)
        // Client uses local time with 5 AM cutoff
        const userToday = getTodayInTimezone(userTimezone);
        
        // Check if user has already logged today (using user's local date)
        const { data: todayLog, error: logError } = await supabase
          .from('daily_logs')
          .select('id')
          .eq('user_id', pref.user_id)
          .eq('date', userToday)
          .maybeSingle();

        if (logError) {
          const errorMsg = `Error checking log for user ${pref.user_id}: ${logError.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          continue;
        }

        // Skip if user already logged today
        if (todayLog) {
          skipped.push({
            userId: pref.user_id,
            reason: 'Already logged today'
          });
          continue;
        }

        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', pref.user_id);

        if (subError) {
          const errorMsg = `Error getting subscriptions for user ${pref.user_id}: ${subError.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          continue;
        }

        if (!subscriptions || subscriptions.length === 0) {
          skipped.push({
            userId: pref.user_id,
            reason: 'No push subscriptions found'
          });
          console.log(`User ${pref.user_id} has no push subscriptions`);
          continue;
        }

        // Validate subscription data
        const validSubscriptions = subscriptions.filter(sub => {
          if (!sub.endpoint || !sub.p256dh_key || !sub.auth_key) {
            console.warn(`Invalid subscription ${sub.id}: missing required fields`);
            return false;
          }
          return true;
        });

        if (validSubscriptions.length === 0) {
          skipped.push({
            userId: pref.user_id,
            reason: 'No valid push subscriptions'
          });
          continue;
        }

        // Get username for notification
        const username = userMap.get(pref.user_id) || 'there';

        // Send notification to all user's devices
        for (const sub of validSubscriptions) {
          try {
            await sendPushNotification(
              {
                endpoint: sub.endpoint,
                p256dh_key: sub.p256dh_key,
                auth_key: sub.auth_key,
              },
              {
                title: '📝 Time to Log Your Activity!',
                body: `Hey ${username}! Don't forget to log your daily activity and keep your streak going! 🔥`,
                url: '/',
                icon: '/favicon.svg',
              }
            );
            notificationsSent.push({ userId: pref.user_id, username, endpoint: sub.endpoint.substring(0, 50) + '...' });
            console.log(`✓ Notification sent to user ${pref.user_id} (${username})`);
          } catch (err: any) {
            const errorMsg = `Error sending to ${sub.endpoint?.substring(0, 50)}...: ${err.message}`;
            console.error(errorMsg);
            
            // If subscription is invalid (410 Gone), delete it
            if (err.statusCode === 410 || err.message?.includes('410') || err.message?.includes('expired') || err.message?.includes('Gone')) {
              try {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('id', sub.id);
                console.log(`Removed expired subscription: ${sub.id}`);
              } catch (deleteErr: any) {
                console.error(`Failed to delete expired subscription ${sub.id}:`, deleteErr.message);
              }
            }
            errors.push(errorMsg);
          }
        }
      } catch (err: any) {
        const errorMsg = `Error processing user ${pref.user_id}: ${err.message}`;
        console.error(errorMsg, err);
        errors.push(errorMsg);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notificationsSent.length,
        details: notificationsSent,
        errors: errors.length > 0 ? errors : undefined,
        skipped: skipped.length > 0 ? skipped : undefined,
        timestamp: new Date().toISOString(),
        checkedUsers: preferences.length,
        processedUsers: preferences.length - errors.length,
        summary: {
          total: preferences.length,
          sent: notificationsSent.length,
          skipped: skipped.length,
          errors: errors.length
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-daily-reminders:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to ensure base64 string is valid
function validateBase64Key(key: string, keyName: string): string {
  if (!key || key.trim().length === 0) {
    throw new Error(`Invalid ${keyName}: key is empty`);
  }
  
  // Remove any whitespace
  const cleanKey = key.trim();
  
  // Try to decode to verify it's valid base64
  try {
    // In Deno, we can use atob to validate
    atob(cleanKey.replace(/-/g, '+').replace(/_/g, '/'));
  } catch (e) {
    throw new Error(`Invalid ${keyName} format: not valid base64`);
  }
  
  return cleanKey;
}

// Helper function to send push notification using web-push protocol
async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  // Import web-push for Deno
  // Using esm.sh for compatibility
  const { default: webpush } = await import('https://esm.sh/web-push@3.6.6');
  
  // Validate and set VAPID details
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys not configured');
  }
  
  webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  // Validate and prepare subscription keys
  // Keys are stored as base64, web-push accepts base64url but also handles base64
  const p256dhKey = validateBase64Key(subscription.p256dh_key, 'p256dh');
  const authKey = validateBase64Key(subscription.auth_key, 'auth');

  // Prepare subscription object in web-push format
  // web-push library accepts base64 strings directly
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: p256dhKey,
      auth: authKey,
    },
  };

  // Prepare notification payload
  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/favicon.svg',
    badge: '/favicon.svg',
    url: payload.url || '/',
    data: {
      url: payload.url || '/',
    },
  });

  try {
    // Send notification
    await webpush.sendNotification(pushSubscription, notificationPayload);
    console.log(`Notification sent to ${subscription.endpoint.substring(0, 50)}...`);
  } catch (error: any) {
    // Handle specific error codes
    if (error.statusCode === 410) {
      // Subscription expired
      throw new Error('Subscription expired (410)');
    }
    if (error.statusCode === 400) {
      // Bad request - might be invalid key format
      console.error('Bad request error - key format issue?', error.message);
      throw new Error(`Invalid subscription format: ${error.message}`);
    }
    throw error;
  }
}
