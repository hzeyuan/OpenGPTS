"use client"
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { SessionContext } from '../context/SessionContext';
import supabase from '~src/utils/supabase';
import { useRouter } from "next/navigation";
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';


export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const [session, setSession] = useState<Session | null>(null)
    const router = useRouter();

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        console.log('退出登录', error)
        // window.localStorage.removeItem('sb-refresh-token')
        // window.localStorage.removeItem('sb-access-token')
        setSession(null);
        if (error) {
            console.error('Logout error', error.message);
        } else {
            console.log('退出登录',)
        }
    };

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('RootLayout', session, event)
                if (event === 'SIGNED_OUT') {
                    setSession(null)
                    router.refresh();
                    router.replace('/')
                } else if (session) {
                    console.log('session', session)
                    if (event === "SIGNED_IN") {
                        router.refresh();
                        router.replace('/chat')

                    };

                }
                setSession(session)

                sendToBackgroundViaRelay({
                    name: 'opengpts',
                    body: {
                        type: event,
                        data: session
                    }
                });

            });
        return () => {
            authListener.subscription.unsubscribe();
        }

    }, [])

    return (
        <SessionContext.Provider value={{
            session,
            setSession,
            logout
        }}>
            {children}
        </SessionContext.Provider >
    )
}
