-- Step 1: Check if cron job exists
SELECT * FROM cron.job WHERE jobname = 'send-daily-reminders';

-- If the above returns empty, run this to CREATE the cron job:
-- (Replace YOUR-PROJECT-REF and YOUR-ANON-KEY with actual values)

/*
SELECT cron.schedule(
  'send-daily-reminders',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-daily-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR-ANON-KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
*/

-- Step 2: After creating, verify it was created:
-- SELECT * FROM cron.job WHERE jobname = 'send-daily-reminders';

-- Step 3: Check recent runs (will be empty until it runs):
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-reminders')
-- ORDER BY start_time DESC 
-- LIMIT 5;

