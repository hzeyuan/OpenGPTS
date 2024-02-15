import type { Database } from '@opengpts/types/supabase'
import { createClient } from '@supabase/supabase-js'


console.log('SUPABASE_URL',process.env.SUPABASE_URL)

const suspabse_url = process.env.PLASMO_PUBLIC_SUPABASE_URL ||  process.env.NEXT_PUBLIC_SUPABASE_URL
const suspabse_public_key = process.env.PLASMO_PUBLIC_USPABASE_API_KEY ||  process.env.NEXT_PUBLIC_USPABASE_API_KEY

const supabase = createClient<Database>(suspabse_url!, suspabse_public_key!)
export default supabase