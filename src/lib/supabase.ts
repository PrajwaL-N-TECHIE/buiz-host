import { createClient } from '@supabase/supabase-js';

// Dedicated Supabase Project for Buiz Studio & Buiz Arena
export const BUIZ_SUPABASE_URL = (
  import.meta.env.VITE_BUIZ_SUPABASE_URL || 'https://paigrnspffprttxtprev.supabase.co'
).trim();

export const BUIZ_SUPABASE_ANON_KEY = (
  import.meta.env.VITE_BUIZ_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaWdybnNwZmZwcnR0eHRwcmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODExMjUsImV4cCI6MjEwNjA1NzEyNX0.jbBQhysqY9L6-ChYmuvUIFFnGTN2-Fco7OVli11b5Bs'
).trim();

export const isBuizSupabaseConfigured = Boolean(
  BUIZ_SUPABASE_URL &&
  BUIZ_SUPABASE_ANON_KEY &&
  BUIZ_SUPABASE_URL.startsWith('https://') &&
  !BUIZ_SUPABASE_URL.includes('placeholder')
);

export const buizSupabase = createClient(BUIZ_SUPABASE_URL, BUIZ_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Default export mappings for backward compatibility
export const supabase = buizSupabase;
export const isSupabaseConfigured = isBuizSupabaseConfigured;
