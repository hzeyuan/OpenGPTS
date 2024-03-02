"use client"
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useRouter } from "next/navigation";
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const [session, setSession] = useState<Session | null>(null)
    const router = useRouter();
    const supabase = createClientComponentClient()
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
                if (event === 'SIGNED_OUT') {
                    setSession(null)
                    router.refresh();
                    router.replace('/')
                } else if (session) {
                    // console.log('session', session)
                    if (event === "SIGNED_IN") {
                        // console.log("登录",session)
                        // router.refresh();
                        // router.replace('/chat')
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
