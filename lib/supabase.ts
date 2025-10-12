import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sitycikfywovzeoatwgi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdHljaWtmeXdvdnplb2F0d2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYzMDIsImV4cCI6MjA3NTc4MjMwMn0.ob4qD0ihhAUVEkbeclfte_6HjIma1gRg_5-ATBoqPsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
