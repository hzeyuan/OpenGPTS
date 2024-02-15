// useAuth.tsx
import { useEffect } from 'react';
import supabase from '~src/utils/supabase';
import { Storage } from "@plasmohq/storage"
import type { User } from '@supabase/supabase-js';
import { useStorage } from '@plasmohq/storage/hook';
import {  useCookies } from 'react-cookie';

export function useAuth() {
    const [user, setUser] = useStorage<User | undefined>({
        key: "opengpts-user",
        instance: new Storage({
            area: "local",
            allCopied: true,
        })
    })
    const [cookies, setCookie, removeCookie] = useCookies(['opengpts-user']);

    // 登录状态检查
    useEffect(() => {
        const init = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                return;
            }
            const userData = data.session?.user;
            setUser(userData);
            setCookie('opengpts-user', JSON.stringify(userData), { path: '/', maxAge: 3600 * 24 * 7 }); // cookies有效期为7天
        };

        init();

        // 设置认证状态变化的监听器
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            const userData = session?.user;
            setUser(userData);
            if (userData) {
                setCookie('opengpts-user', JSON.stringify(userData), { path: '/', maxAge: 3600 * 24 * 7 });
            } else {
                removeCookie('opengpts-user', { path: '/' }); // 如果用户登出，清除cookies
            }
        });

        // 返回清理函数，用于在组件卸载时取消监听
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
