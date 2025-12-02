# VAPID Keys Setup Guide

VAPID (Voluntary Application Server Identification) keys are required for web push notifications. They authenticate your application with push services.

## Generate VAPID Keys

### Option 1: Using Node.js (Recommended)

1. Install web-push globally:
```bash
npm install -g web-push
```

2. Generate keys:
```bash
web-push generate-vapid-keys
```

3. You'll get output like:
```
Public Key: BMx...your-public-key...xyz
Private Key: Abc...your-private-key...123
```

### Option 2: Online Generator

Visit: https://vapidkeys.com/
- Click "Generate Keys"
- Copy the Public Key and Private Key

### Option 3: Using npm script

Add to your `package.json`:
```json
"scripts": {
  "generate-vapid": "web-push generate-vapid-keys"
}
```

Then run: `npm run generate-vapid`

## Setting Up Keys

### 1. Frontend (Public Key)

Add to your `.env` file:
```
VITE_VAPID_PUBLIC_KEY=BMx...your-public-key...xyz
```

This key will be used by the browser to subscribe to push notifications. It's safe to expose publicly.

### 2. Backend (Private Key - Supabase Edge Function)

The private key needs to be stored securely in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name**: `VAPID_PRIVATE_KEY`
   - **Value**: `Abc...your-private-key...123`
4. Save the secret

**IMPORTANT**: Never commit the private key to version control!

## Verify Setup

After setting up:

1. Start your dev server: `npm run dev`
2. Go to your Profile page
3. Try to enable notifications
4. Check browser console for any errors
5. If VAPID key is missing, you'll see a warning in console

## Troubleshooting

- **"VAPID public key not configured"**: Make sure `VITE_VAPID_PUBLIC_KEY` is in your `.env` file
- **"Invalid VAPID key"**: Ensure keys are in the correct format (base64 URL-safe)
- **"Permission denied"**: User needs to grant notification permission in browser settings

