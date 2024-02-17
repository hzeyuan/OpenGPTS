import type { Database } from '@opengpts/types/supabase'
import { createClient } from '@supabase/supabase-js'



const suspabse_url = process.env.PLASMO_PUBLIC_SUPABASE_URL ||  process.env.NEXT_PUBLIC_SUPABASE_URL
const suspabse_public_key = process.env.PLASMO_PUBLIC_SUSPABASE_API_KEY ||  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient<Database>(suspabse_url!, suspabse_public_key!)
export default supabase