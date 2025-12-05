# Send Feedback Edge Function

This Supabase Edge Function sends user feedback via Resend API.

## Setup

1. Create a Resend account at https://resend.com
2. Get your API key from the Resend dashboard
3. Set the following secrets in Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set FEEDBACK_RECIPIENT_EMAIL=your_email@example.com
   ```

4. **Important - From Email Address:**
   - For testing: The function will use `onboarding@resend.dev` by default (works for first 100 emails)
   - For production: Verify a domain in Resend and set a custom from email:
     ```bash
     supabase secrets set RESEND_FROM_EMAIL=feedback@yourdomain.com
     ```
   - To verify a domain in Resend: Go to Domains → Add Domain → Follow verification steps

## Deployment

Deploy the function using:
```bash
supabase functions deploy send-feedback
```

## Usage

The function expects a POST request with the following body:
```json
{
  "type": "bug" | "feature" | "other",
  "title": "Feedback title",
  "description": "Feedback description",
  "username": "User's username",
  "userEmail": "user@example.com"
}
```

The function requires authentication via Supabase auth token in the Authorization header.

