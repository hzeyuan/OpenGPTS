

import { Action, ActionType } from "./action";
import { Observation } from "./observe";
import { Thought } from "./thought";


type Decision = {
    thought: Thought,
    observation: Observation
}


interface SendMessageToWindowMessage {
    [key: string]: any;
    action?: Action;
}

type SendToBackgroundViaRelayRequestBody<T> = {
    type: T;
    tabId?: number;
    windowId?: number;
    [key: string]: any;
    message?: SendMessageToWindowMessage;

};

type SendToBackgroundViaRelayResponseBody = {
    code: number;
    message?: string;
    data?: Record<string, any>
};



type PredictAction = (args: {
    task: string,
    systemMessage: string,
    observation: Observation,
    thought: Thought,
    thoughts?: Thought[],
    routes?: string[],
    options: {
        vision: boolean
    }
}) => Promise<Action>





type InteractiveElement = {
    element: any;
    clickable: boolean;
    area: number;
    rects: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    }[];
    tagName: any;
    text?: string;

}

export {
    SendMessageToWindowMessage,
    InteractiveElement,
    SendToBackgroundViaRelayRequestBody,
    SendToBackgroundViaRelayResponseBody,
    PredictAction,
}

