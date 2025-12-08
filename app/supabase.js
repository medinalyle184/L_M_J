import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pihaxunahzdzywnfplch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaGF4dW5haHpkenl3bmZwbGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTY3ODEsImV4cCI6MjA3OTk3Mjc4MX0.sAl25UfcBjYY_61GWZ5Uu3UZjLk0dauV5_niCPzKA2s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
