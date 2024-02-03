import type { OMessage } from "@opengpts/types";
import _ from "lodash";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";


interface ChatAPIRequest {
    model: string;
    messages: Array<ChatCompletionMessageParam>;
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
    const transformedMessages = messages.map(message => {
        if (message.role == 'function') {
            return _.pick(message, ['name', 'role', 'content'])
        }
        return {
            role: message.role,
            content: message.content
        };
    });

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