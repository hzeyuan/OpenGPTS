type ActionType = "SEND_MESSAGE_TO_WINDOW" | 'OPEN_WINDOW' | 'GET_CURRENT_WINDOW'
    | 'GET_SCREENSHOT' | 'BROWSER_ENV' | 'CHECK_PAGE_LOADED' | 'BOARDCAST_MESSAGE_ALL_WINDOW'
    | 'FULL_SCREENSHOT' | 'ACTIONS' | 'INJECT_CODE' | 'SET_ZOOM'

    | 'SIGNED_IN' | 'INITIAL_SESSION' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'SIGNED_OUT'


type OperationType = "CLICK" | "TYPE" | "SELECT" | "HOVER" | "SCROLL" | "WAIT" | "WAITIME";

interface Action {
    ACTION: OperationType;
    ELEMENT?: {
        x?: number;
        y?: number;
        uniqueSelector?: string;
        outerHTML?: string;
    } | number;
    VALUE?: any
}

export {
    ActionType,
    OperationType,
    Action
}