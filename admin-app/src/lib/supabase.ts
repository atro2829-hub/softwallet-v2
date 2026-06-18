import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnywltnzjkpnhnapyvem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueXdsdG56amtwbmhuYXB5dmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTc1ODcsImV4cCI6MjA5NzM3MzU4N30.5DLh2LqrhpgML6VXY_5yLHt5T72n8Jw9s81Shn-qlrU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);