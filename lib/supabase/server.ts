import { createClient } from '@supabase/supabase-js'

// Simple server client without SSR for now
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
