import type { ApiDescription, OMessage, ToolRow } from "@opengpts/types";
import {pick} from "lodash-es";
import { ofetch } from 'ofetch'
import type { ChatCompletionMessageParam, ChatCompletionCreateParams } from "openai/resources";

const request = ofetch.create({
    // baseURL: "`https://chat.openai.com",
    retry: 3,
    headers: {
        'content-type': 'application/json',
    },
    retryDelay: 500, // ms
    timeout: 100000,
    parseResponse: JSON.parse,
});


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
    functions?: ChatCompletionCreateParams.Function[]
}


function transformMessages(messages: OMessage[]): Array<ChatCompletionMessageParam> {
    const transformedMessages = messages.map(message => {
        if (message.role == 'function') {
            return pick(message, ['name', 'role', 'content'])
        }
        return {
            role: message.role,
            content: message.content
        };
    });

    return transformedMessages as  Array<ChatCompletionMessageParam>
}




// {
//     "type": "object",
//     "properties": {
//       "location": {
//         "type": "string",
//         "description": "The city and state, e.g. San Francisco, CA"
//       },
//       "format": {
//         "type": "string",
//         "enum": [
//           "celsius",
//           "fahrenheit"
//         ],
//         "description": "The temperature unit to use. Infer this from the users location."
//       }
//     },
//     "required": [
//       "location",
//       "format"
//     ]
//   }
function convertToolToApiDescription(tool: ToolRow): ApiDescription {
    return {
        name: tool.name,
        description: tool.description || 'No description available.',
        parameters: tool.parameters as ApiDescription['parameters']
    };
}


async function sendHttpRequest(row: ToolRow, params: Record<string, any>): Promise<string> {

    console.log('sendHttpRequest')

    function isAuthCredentialsWithToken(authCredentials: any): authCredentials is { token: string } {
        return typeof authCredentials === 'object' && 'token' in authCredentials;
    }

    // 同样，为Basic Auth提供一个类型守卫
    function isAuthCredentialsWithBasic(authCredentials: any): authCredentials is { username: string, password: string } {
        return typeof authCredentials === 'object' && 'username' in authCredentials && 'password' in authCredentials;
    }

    if (!row.base_url || !row.http_method) {
        throw new Error('Base URL and HTTP method are required.');
    }

    const url = new URL(`${row.base_url}${row.endpoint ?? ''}`);
    const method = row.http_method.toLowerCase();
    const headers: { [key: string]: string } = {};

    // 处理认证信息
    if (row.auth_type && row.auth_credentials) {
        if (row.auth_type === 'Bearer' && isAuthCredentialsWithToken(row.auth_credentials)) {
            headers['Authorization'] = `Bearer ${row.auth_credentials.token}`;
        } else if (row.auth_type === 'Basic' && isAuthCredentialsWithBasic(row.auth_credentials)) {
            const token = btoa(`${row.auth_credentials.username}:${row.auth_credentials.password}`);
            headers['Authorization'] = `Basic ${token}`;
        }
    }


    let body;

    if (method === 'get') {
        console.log('get params', params)
        // 对于GET请求，将参数添加到URL的查询字符串中
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    } else {
        console.log('post params', params)
        body = JSON.stringify(params);
    }
    console.log("url", url, "body", body, params)
    // 将认证头和可能的其他头信息合并到请求配置中
    const requestOptions = {
        method,
        headers: { ...headers },
        ...(body ? { body } : {})
    };
    console.log('requestOptions', requestOptions)
    try {
        const { code, data, message } = await ofetch(url.toString(), requestOptions).catch(err => {
            console.log('err', err)
            return err;
        })
        console.log('code', code, 'data', data)
        if (code !== 0) {
            return message
        }
        return JSON.stringify(data)

    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

export {
    request,
    transformMessages,
    convertToolToApiDescription,
    sendHttpRequest
}