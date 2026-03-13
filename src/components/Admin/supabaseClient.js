import { createClient } from '@supabase/supabase-js';

// These read the variables from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This creates the single connection point for your whole app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);