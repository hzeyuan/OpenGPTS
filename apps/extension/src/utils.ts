import type { OMessage } from "@opengpts/types";


interface ChatAPIRequest {
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    frequency_penalty?: number;
    logit_bias?: { [token: string]: number };
    logprobs?: boolean;
    top_logprobs?: number;
    max_tokens?: number;
    n?: number;
    presence_penalty?: number;
    response_format?: { type: string };
    seed?: number;
    stop?: string | string[];
    stream?: boolean;
    temperature?: number;
    top_p?: number;
    tools?: Array<{ name: string }>;
    tool_choice?: string | { type: string; function: { name: string } };
}


function transformMessages({ model, messages, args }: {
    model: string,
    messages: OMessage[],
    args?: Record<string, any>
}): ChatAPIRequest {
    const transformedMessages = messages.map(message => ({
        role: message.role,
        content: typeof message.content === 'string' ? message.content : 'Complex content cannot be displayed'
    }));

    const request: ChatAPIRequest = {
        model,
        messages: transformedMessages,
        // 设置其他可选字段，默认值或根据需要指定值
        frequency_penalty: 0,
        logprobs: false,
        ...args
    };

    return request;
}


export {
    transformMessages
}