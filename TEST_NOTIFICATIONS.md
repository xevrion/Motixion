# Testing Push Notifications

## Quick Test Guide

### 1. Test Edge Function Manually

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with your actual values:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or test via Supabase Dashboard:
1. Go to **Edge Functions** → **send-daily-reminders**
2. Click **Invoke Function**
3. Use empty body: `{}`

### 2. Check Function Logs

In Supabase Dashboard:
- **Edge Functions** → **send-daily-reminders** → **Logs**
- Look for any errors or successful sends

### 3. Verify Service Worker

1. Open your deployed site: https://motixion.vercel.app
2. Open DevTools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Service Workers** in left sidebar
5. You should see `sw.js` registered

### 4. Check Browser Console

After enabling notifications in Profile:
- Look for messages like "Service Worker registered"
- Check for any VAPID key errors
- Verify subscription was created

### 5. Test Notification

You can send a test notification manually by:
1. Enabling notifications in Profile
2. Waiting for the scheduled time, OR
3. Manually triggering the Edge Function

## Troubleshooting

**"VAPID public key not configured"**
→ Make sure `VITE_VAPID_PUBLIC_KEY` is set in Vercel environment variables and site is redeployed

**"Notification permission denied"**
→ Check browser settings → Notifications → Allow for motixion.vercel.app

**"Service worker not registering"**
→ Make sure you're on HTTPS (Vercel provides this automatically)
→ Check browser console for errors

**"Edge Function error"**
→ Check Supabase secrets are set correctly
→ Check Edge Function logs in Supabase Dashboard

