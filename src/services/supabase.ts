import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ifvnmkmhpfjdqygzgssq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YCASHjbf33i6VQrmMgc6jA_KO4ERoTS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
