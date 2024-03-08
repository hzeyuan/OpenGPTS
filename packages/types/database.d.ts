import { Database } from "./supabase";

type ToolRow = Database['public']['Tables']['tools']['Row']
type PlanRow = Database['public']['Tables']['plans']['Row']
type UserAbilitiesRow = Database['public']['Tables']['user_abilities']['Row']
export {
    ToolRow,
    PlanRow,
    UserAbilitiesRow
}