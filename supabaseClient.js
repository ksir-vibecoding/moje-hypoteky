import { createClient } from '@supabase/supabase-js';

// URL najdeš v Supabase Settings -> API (vypadá jako https://xyz.supabase.co)
const supabaseUrl = 'https://hqssoqoiyhlxsgupowvz.supabase.co'; 
// Sem vlož ten NOVĚ vygenerovaný klíč
const supabaseAnonKey = 'sb_publishable_j8Sr5mMGLg2L0pRznCSLcQ_JxVOdXWB'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
