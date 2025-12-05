// Supabase Edge Function: Send Feedback Email
// This function receives feedback from users and sends it via Resend API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RECIPIENT_EMAIL = Deno.env.get('FEEDBACK_RECIPIENT_EMAIL') || '';

interface FeedbackRequest {
  type: 'bug' | 'feature' | 'other';
  title: string;
  description: string;
  username: string;
  userEmail: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const feedbackData: FeedbackRequest = await req.json();

    // Validate input
    if (!feedbackData.type || !feedbackData.title || !feedbackData.description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (feedbackData.title.length < 3 || feedbackData.title.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Title must be between 3 and 100 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (feedbackData.description.length < 10 || feedbackData.description.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Description must be between 10 and 2000 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!RECIPIENT_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'Recipient email not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Set the sender email to a safe default
    const fromEmail = "onboarding@resend.dev";
    
    const { type, title, description } = feedbackData;

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Deno.env.get("FEEDBACK_RECIPIENT_EMAIL"),
        subject: `Motixion Feedback: ${title}`,
        html: `<p><b>Type:</b> ${type}</p><p>${description}</p>`
      })
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.log("RESEND API ERROR:", errText);
      return new Response(JSON.stringify({ error: errText }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

