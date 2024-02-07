import type { Database } from '@opengpts/types/supabase'
import { createClient } from '@supabase/supabase-js'



const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.USPABASE_API_KEY!)
export default supabase