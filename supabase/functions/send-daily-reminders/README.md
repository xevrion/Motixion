# Send Daily Reminders Edge Function

This Edge Function sends push notifications to users who have enabled daily reminders but haven't logged their activity yet today.

## Setup

### 1. Deploy the Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-daily-reminders
```

### 2. Set Environment Variables (Secrets)

```bash
# Set VAPID keys (get these from VAPID_SETUP.md)
supabase secrets set VAPID_PUBLIC_KEY=your-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-private-key
supabase secrets set VAPID_EMAIL=noreply@motixion.vercel.app
```

Alternatively, set them in Supabase Dashboard:
- Go to **Project Settings** → **Edge Functions** → **Secrets**
- Add each secret individually

### 3. Set Up Cron Job

The function needs to be called periodically. You can set this up using:

**Option A: Supabase pg_cron (Recommended)**

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule function to run every hour
-- Adjust the schedule as needed (e.g., every 30 minutes: '*/30 * * * *')
SELECT cron.schedule(
  'send-daily-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-daily-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Option B: External Cron Service**

Use a service like:
- [cron-job.org](https://cron-job.org/)
- [EasyCron](https://www.easycron.com/)
- [GitHub Actions](https://github.com/features/actions) (for scheduled workflows)

Schedule to call: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-daily-reminders`

**Option C: Vercel Cron Jobs (if deployed on Vercel)**

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 * * * *"
  }]
}
```

## Testing

Test the function manually:

```bash
# Using Supabase CLI
supabase functions invoke send-daily-reminders

# Or using curl
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-daily-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## How It Works

1. Function runs on schedule (e.g., every hour)
2. Queries users with `enabled = true` in `notification_preferences`
3. For each user:
   - Checks if current time matches their reminder time (30-minute window)
   - Checks if they've already logged today
   - Gets their push subscriptions
   - Sends notification to all their devices
4. Removes expired/invalid subscriptions
5. Returns summary of notifications sent

## Monitoring

Check function logs:
```bash
supabase functions logs send-daily-reminders
```

Or view in Supabase Dashboard:
- Go to **Edge Functions** → **send-daily-reminders** → **Logs**

