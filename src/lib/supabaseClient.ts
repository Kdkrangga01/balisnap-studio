import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseClientConfigured = Boolean(
    rawUrl && rawKey && rawUrl !== 'https://your-project-id.supabase.co'
);

const supabaseUrl = isSupabaseClientConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseClientConfigured ? rawKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);