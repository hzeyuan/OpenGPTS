import { createContext, type Dispatch, type SetStateAction } from "react";


interface OrionRootContext {
    setSize: Dispatch<SetStateAction<{ width: number; height: string; }>>
}


export const OrionRootContext = createContext<OrionRootContext | null>(null);