
import type { QueryData } from "@supabase/supabase-js";
import supabase from "~src/utils/supabase";
import type { UserAbilitiesRow } from '@opengpts/types';

type GetUserAbilities = (email: string) => Promise<UserAbilitiesRow>;

const getUserAbilities: GetUserAbilities = async (email: string) => {
    const UserAbilitiesWithEmailQuery = supabase
        .from("user_abilities")
        .select("*")
        .eq("email", email)
        .single();


    const { data, error } = await UserAbilitiesWithEmailQuery;
    if (error) throw error;
    return data as UserAbilitiesRow;
}



export {
    getUserAbilities
}