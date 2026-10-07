/// <reference types="@types/deno" />

// Supabase Edge Function: SIGAP Scan & Report Handler
// Silent redirect to Google Form 

const DESTINATION_URL = "https://forms.gle/ASr54C2TsXuWePyN9";

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

