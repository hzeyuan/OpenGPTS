// useAuth.tsx
import { useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from '@supabase/supabase-js';
import { useStorage } from '@plasmohq/storage/hook';
import supabaseClient from '~src/utils/supabase';
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';

export function useAuth(
    env: 'ext' | 'web' = 'web',
    params?: {
        onSignIn?: () => void,
        onSignOut?: () => void
    }) {
    const supabase = env === 'web' ? createClientComponentClient() : supabaseClient
    const [user, setUser] = useStorage<User | undefined>("opengpts-user")

    // 登录状态检查
    useEffect(() => {
        if (env === 'ext') return

        const updateAuthState = (event: string, session: any) => {
            const userData = session?.user;
            console.log("userData", userData, event, env);
            setUser(userData);

            if (event === "SIGNED_IN") {
                params?.onSignIn?.();
            } else if (event === 'SIGNED_OUT') {
                params?.onSignOut?.();
                setUser(undefined);
            }

            sendToBackgroundViaRelay({
                name: 'opengpts',
                body: {
                    type: event,
                    data: userData
                }
            });
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(updateAuthState);

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, []);

    // 登出函数
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        console.log('退出登录', error)
        setUser(undefined);
        if (error) {
            console.error('Logout error', error.message);
        } else {
            console.log('退出登录',)
        }
    };

    return { user, logout };
}
