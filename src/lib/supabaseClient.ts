import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ffmlnkhfguziuaodfold.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbWxua2hmZ3V6aXVhb2Rmb2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNDI3MjQsImV4cCI6MjEwODgxODcyNH0.9G8XvaMEadzfBRdu0xkdJ6T13VCp_4VnWPsftivZIGw';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_KEY;

export const isSupabaseClientConfigured = Boolean(
    rawUrl && rawKey && rawUrl !== 'https://your-project-id.supabase.co'
);

const supabaseUrl = isSupabaseClientConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseClientConfigured ? rawKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
