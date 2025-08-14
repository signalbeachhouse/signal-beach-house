// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// ✅ Use your actual Supabase project URL and insert your key below
const supabaseUrl = 'https://wjkjuymwzrkhnnpgxatub.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

