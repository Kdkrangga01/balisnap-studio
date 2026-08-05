/// <reference types="@types/deno" />

// Supabase Edge Function: SIGAP Scan & Report Handler
// Silent redirect to Google Form

const DESTINATION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf7pj4rSdPIf3CZcrDvvq0tYQ16VhhCWIt1Ts3pp6b_WpLzSQ/viewform";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Redirect silently to Google Form
  return Response.redirect(DESTINATION_URL, 302);
});
