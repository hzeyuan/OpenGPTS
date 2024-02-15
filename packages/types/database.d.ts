import { Database } from "./supabase";

type ToolRow = Database['public']['Tables']['tools']['Row']


export {
    ToolRow
}