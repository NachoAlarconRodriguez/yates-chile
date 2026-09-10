import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nnzixzoevxeeuayidyuk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueml4em9ldnhlZXVheWlkeXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODUwNTksImV4cCI6MjEwMjY2MTA1OX0.XP-HKsMmrauNihtlBN_XCnM74RGY0vFmkSJDcjb-MF0';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueml4em9ldnhlZXVheWlkeXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA4NTA1OSwiZXhwIjoyMTAyNjYxMDU5fQ.WwBk8CKY8IwBJ6Yd0XeHOt8fsdhD_cOkQCFqaJTjksc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
