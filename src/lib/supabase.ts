import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtiwwhnoaiiwvgivtcko.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aXd3aG5vYWlpd3ZnaXZ0Y2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTU1MzksImV4cCI6MjA5MjQzMTUzOX0.wHiAM-sCSs_yzBfTDxwBB882lJcw6q-QVo7dcsxXYl8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
