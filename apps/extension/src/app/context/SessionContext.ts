import type { Session } from "@supabase/supabase-js"
import React from "react"

const SessionContext = React.createContext<{
    session: Session | null
    setSession: React.Dispatch<React.SetStateAction<Session | null>>
    logout: () => void;
    subscription: any;
    setSubscription: React.Dispatch<React.SetStateAction<any>>;
}>({
    session: null,
    setSession: () => null,
    logout: () => null,
    subscription: null,
    setSubscription: () => null
})

const useSessionContext = () => {
    const context = React.useContext(SessionContext)
    if (!context) {
        throw new Error('useSessionContext must be used within a SessionProvider')
    }
    return context
}

export {
    SessionContext,
    useSessionContext
}