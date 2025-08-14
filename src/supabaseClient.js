import { createClient } from '@supabase/supabase-js'

// 🧭 Replace these two with your actual values from Supabase
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
