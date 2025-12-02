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

// Get today's date accounting for 5 AM cutoff
// This function should match the client-side getToday() logic
function getToday(): string {
  const now = new Date();
  const hours = now.getUTCHours();
  
  // If before 5 AM UTC, use yesterday's date
  let date = new Date(now);
  if (hours < 5) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

    const today = getToday();
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

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
        // Parse reminder time
        const [reminderHour, reminderMinute] = pref.reminder_time.split(':').map(Number);
        
        // Check if it's time for this user's reminder (within 30 minute window)
        // Note: This is simplified - in production, handle timezones properly
        const currentMinutes = currentHour * 60 + currentMinute;
        const reminderMinutes = reminderHour * 60 + (reminderMinute || 0);
        const timeDiff = Math.abs(currentMinutes - reminderMinutes);
        
        // Only send if within 30 minute window
        if (timeDiff > 30) {
          continue;
        }

        // Check if user has already logged today
        const { data: todayLog, error: logError } = await supabase
          .from('daily_logs')
          .select('id')
          .eq('user_id', pref.user_id)
          .eq('date', today)
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
