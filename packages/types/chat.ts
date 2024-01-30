import type { ChatRequestOptions, FunctionCall, RequestOptions, Message } from "ai";
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



interface OMessage extends Message {
    isError?: boolean
    command?: OCommand;
    quoteMessage?: QuoteMessage;
    images?: string[];
    display?: {
        name: string;
        icon?: string;
    }
}


export type { OMessage, OChatRequest, ChatMessage, QuoteMessage, OCommand, Chat, Mention }