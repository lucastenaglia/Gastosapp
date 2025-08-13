import { createClient } from '@supabase/supabase-js'

// Reemplaza estas URLs con las de tu proyecto Supabase
const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 