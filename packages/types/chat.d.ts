import type { ChatRequestOptions, FunctionCall, RequestOptions, Message, JSONValue, ChatRequest } from "ai";
import { Author, Display, Gizmo } from "./gizmo";


interface Chat {
    chatId: string;
    // llm: ModelKey,
    latestReply: string,
    latestRecord: {
        message: Message
    },
    text: string;
    created_at: number,
    updated_at: number,
    userId: number;
    messages: OMessage[];
    workspaceId: number;
    title?: string,
    fileList?: Record<string, any>[];
    // type: "tab" | "image" | "file";
}


interface OCommand {
    icon?: string;
    name: string;
    prompt?: string;
}


interface Mention {
    key: string;
    name: string;
    icon?: string;
    type: 'GPTs' | 'languageModel';
    meta?: Object
}

type OChatRequest = {
    messages: OMessage[];
    options?: RequestOptions;
    functions?: ChatRequestOptions['functions'];
    function_call?: FunctionCall;
    data?: Record<string, string>;
    mention?: Mention;
};



type ChatMessage = {
    chatId: string;
    messages: OMessage[];
}

interface QuoteMessage extends OMessage {
    chatId: string;
}



interface OMessage {
    id: string;
    createdAt?: Date;
    content: string | JSX.Element
    ui?: string | JSX.Element | JSX.Element[] | null | undefined;
    role: 'system' | 'user' | 'assistant' | 'function' | 'data';
    /**
     * If the message has a role of `function`, the `name` field is the name of the function.
     * Otherwise, the name field should not be set.
     */
    name?: string;
    /**
     * If the assistant role makes a function call, the `function_call` field
     * contains the function call name and arguments. Otherwise, the field should
     * not be set.
     */
    function_call?: string | FunctionCall;
    data?: JSONValue;
    isError?: boolean
    command?: OCommand;
    quoteMessage?: QuoteMessage;
    images?: string[];
    display?: {
        name: string;
        icon?: any;
    }
}


type OFunctionCallHandler = (chatMessages: OMessage[], functionCall: FunctionCall) => Promise<OChatRequest | void>;


export type { OMessage, OChatRequest, ChatMessage, QuoteMessage, OCommand, Chat, Mention, OFunctionCallHandler }