import { createClient } from '@supabase/supabase-js';

// Vlož sem přesně tuto adresu (BEZ /rest/v1/ na konci)
const supabaseUrl = 'https://hqssoqoiyhlxsgupowvz.supabase.co';

// Zde musí být tvůj "anon" klíč (začíná eyJ...)
const supabaseKey = 'sb_publishable_j8Sr5mMGLg2L0pRznCSLcQ_JxVOdXWB'; 

export const supabase = createClient(supabaseUrl, supabaseKey);