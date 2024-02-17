// useAuth.tsx
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from '@supabase/supabase-js';
import { useStorage } from '@plasmohq/storage/hook';
import supabaseClient from '~src/utils/supabase';

export function useAuth(
    env: 'ext' | 'web' = 'web',
    params?: {
        onSignIn?: () => void,
        onSignOut?: () => void
    }) {

    const supabase = env === 'web' ? createClientComponentClient() : supabaseClient
    // localStorage.getItem('supabase.auth.token')
    const [user, setUser] = useStorage<User | undefined>("opengpts-user")



    return { user };
}
