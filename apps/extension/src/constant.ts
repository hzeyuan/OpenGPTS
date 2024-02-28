import type { ChatConfig, ModelOptions,OpenGPTsConfig } from "@opengpts/types"
import chatgpt3_5Svg from '~assets/chatgpt3.5.svg'
import chatgpt4Svg from '~assets/chatgpt4.svg'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.PLASMO_PUBLIC_API_BASE_URL
const WEBSITE_URL = 'https://open-gpts.vercel.app'
const SG_SEARCH_URL = 'https://sg.search.yahoo.com/search'

const MODEL_OPTIONS: ModelOptions[] =
    [
        {
            key: 'gpt-3.5-turbo-0301',
            name: 'gpt-3.5-turbo-0301',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-0125',
            name: 'gpt-3.5-turbo-0125',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-16k-0613',
            name: 'gpt-3.5-turbo-16k-0613',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-16k',
            name: 'gpt-3.5-turbo-16k',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5',
            name: 'gpt-3.5',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-0613',
            name: 'gpt-3.5-0613',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-1106',
            name: 'gpt-3.5-1106',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-instruct',
            name: 'gpt-3.5-turbo-instruct',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-3.5-turbo-instruct-0914',
            name: 'gpt-3.5-turbo-instruct-0914',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4-0125-preview',
            name: 'gpt-4-0125-preview',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4-1106-preview',
            name: 'gpt-4-preview',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4',
            name: 'gpt-4',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4-0613',
            name: 'gpt-4-0613',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4-32k',
            name: 'gpt-4-preview',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'gpt-4-32k-0613',
            name: 'gpt-4-32k-0613',
            description: 'ChatGPT 4-turbo (API)',
            modes: ['OpenAI API'],
            icon: chatgpt3_5Svg
        },
        // opengpts
        {
            key: 'ChatGPT3.5 Turbo',
            name: 'ChatGPT3.5 Turbo',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenGPTs',],
            icon: chatgpt3_5Svg
        },
        {
            key: 'ChatGPT4 Turbo',
            name: 'ChatGPT4 Turbo',
            description: 'ChatGPT 3.5-turbo (API)',
            modes: ['OpenGPTs'],
            icon: chatgpt3_5Svg
        },

        // web
        {
            key: 'chatgptFree35',
            name: 'ChatGPT3.5 (Web)',
            description: 'ChatGPT (Web)',
            modes: ['ChatGPT webapp'],
            icon: chatgpt3_5Svg
        },
        {
            key: 'chatgptPlus4Browsing',
            name: 'ChatGPT4 (Web)',
            description: 'ChatGPT (Web)',
            modes: ['ChatGPT webapp'],
            icon: chatgpt4Svg
        },
        {
            key: 'chatgptPlus4',
            name: 'GPTs (Web)',
            description: 'GPTs (Web)',
            modes: ['ChatGPT webapp'],
            icon: chatgpt4Svg
        }
    ]
const DEFAULT_MODEL = MODEL_OPTIONS.find((model) => model.key === 'chatgptFree35')!


const CHATGPT_WEBAPPP_DEFAULT_CONFIG: ChatConfig = {
    token: '',
    customChatGptWebApiUrl: 'https://chat.openai.com',
    customChatGptWebApiPath: '/backend-api/conversation',
    disableWebModeHistory: false,
    chatgptArkoseReqParams: 'cgb=vhwi',
    chatgptArkoseReqUrl: '',
}


const OpenGPTS_BASE_URL = 'http://127.0.0.1:1337/api/chat'
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

const DEFAULT_CONFIG: OpenGPTsConfig = {
    mode: 'OpenGPTs',
    apiKey: '',
    baseUrl: OPENAI_BASE_URL,
    isProxy: false
}


const chatgptWebModelKeys = [
    'chatgptFree35',
    'chatgptPlus4Browsing',
    'chatgptPlus4'
]


export {
    MODEL_OPTIONS,
    DEFAULT_MODEL,
    chatgptWebModelKeys,
    DEFAULT_CONFIG,
    CHATGPT_WEBAPPP_DEFAULT_CONFIG,
    WEBSITE_URL,
    SG_SEARCH_URL,
    OPENAI_BASE_URL,
    OpenGPTS_BASE_URL,
    BASE_URL
}

