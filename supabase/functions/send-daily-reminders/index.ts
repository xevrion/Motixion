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

// Check if current time in user's timezone matches reminder time (within 1 hour)
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
  
  // Check if current time matches reminder time (within 1 hour window)
  // Since cron runs hourly, we send if reminder time falls in current hour
  const currentMinutes = currentHour * 60 + currentMinute;
  const reminderMinutes = reminderHour * 60 + reminderMinute;
  const timeDiff = Math.abs(currentMinutes - reminderMinutes);
  
  // Send if within 60 minute window
  return timeDiff <= 60;
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

    // Find users with enabled notifications
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select(`
        *,
        users(id, username)
      `)
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

    const notificationsSent = [];
    const errors = [];

    for (const pref of preferences) {
      try {
        // Get user's timezone (default to UTC if not set)
        const userTimezone = pref.timezone || 'UTC';
        
        // Check if it's time for this user's reminder (in their timezone)
        if (!isReminderTime(pref.reminder_time, userTimezone)) {
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
          errors.push(`Error checking log for user ${pref.user_id}: ${logError.message}`);
          continue;
        }

        // Skip if user already logged today
        if (todayLog) {
          continue;
        }

        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', pref.user_id);

        if (subError) {
          errors.push(`Error getting subscriptions for user ${pref.user_id}: ${subError.message}`);
          continue;
        }

        if (!subscriptions || subscriptions.length === 0) {
          continue;
        }

        // Send notification to all user's devices
        for (const sub of subscriptions) {
          try {
            await sendPushNotification(
              {
                endpoint: sub.endpoint,
                p256dh_key: sub.p256dh_key,
                auth_key: sub.auth_key,
              },
              {
                title: '📝 Time to Log Your Activity!',
                body: `Hey ${(pref.users as any)?.username || 'there'}! Don't forget to log your daily activity and keep your streak going! 🔥`,
                url: '/',
                icon: '/favicon.svg',
              }
            );
            notificationsSent.push({ userId: pref.user_id, endpoint: sub.endpoint });
          } catch (err: any) {
            // If subscription is invalid (410 Gone), delete it
            if (err.message?.includes('410') || err.message?.includes('expired') || err.message?.includes('Gone')) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
              console.log(`Removed expired subscription: ${sub.id}`);
            }
            errors.push(`Error sending to ${sub.endpoint}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`Error processing user ${pref.user_id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notificationsSent.length,
        details: notificationsSent,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
        checkedUsers: preferences.length,
        processedUsers: preferences.length - errors.length,
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

// Helper function to send push notification using web-push protocol
async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  // Import web-push for Deno
  // Using esm.sh for compatibility
  const { default: webpush } = await import('https://esm.sh/web-push@3.6.6');
  
  // Set VAPID details
  webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  // Prepare subscription object in web-push format
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh_key,
      auth: subscription.auth_key,
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
    console.log(`Notification sent to ${subscription.endpoint}`);
  } catch (error: any) {
    // Handle specific error codes
    if (error.statusCode === 410) {
      // Subscription expired
      throw new Error('Subscription expired (410)');
    }
    throw error;
  }
}
