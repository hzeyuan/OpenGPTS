// useAuth.tsx
import { useEffect } from 'react';
import { Storage } from "@plasmohq/storage"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from '@supabase/supabase-js';
import { useStorage } from '@plasmohq/storage/hook';
import { useCookies } from 'react-cookie';

export function useAuth(params?: {
    onSignIn?: () => void,
    onSignOut?: () => void
}) {
    const supabase = createClientComponentClient();
    const [user, setUser] = useStorage<User | undefined>({
        key: "opengpts-user",
        instance: new Storage({
            area: "session",
            allCopied: true,
        })
    }, v => v || undefined)
    const [cookies, setCookie, removeCookie] = useCookies(['opengpts-user']);

    // 登录状态检查
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            const userData = session?.user;

            console.log("userData", userData, _event)
            if (_event === "SIGNED_IN") {
                setUser(userData);
                setCookie('opengpts-user', JSON.stringify(userData), { path: '/', maxAge: 3600 * 24 * 7 });
                params?.onSignIn && params.onSignIn();
            } else if (_event === 'SIGNED_OUT') {
                setUser(undefined);
                removeCookie('opengpts-user', { path: '/' });
                params?.onSignOut && params.onSignOut();

            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, []);

    // 登出函数
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error', error.message);
        } else {
            setUser(undefined);
            removeCookie('opengpts-user', { path: '/' }); // 登出时清除cookies
        }
    };

    return { user, logout };
}
