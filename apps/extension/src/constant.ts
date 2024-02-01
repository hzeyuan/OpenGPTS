import type { ChatConfig, ModelOptions } from "@opengpts/types"
import chatgpt3_5Svg from '~assets/chatgpt3.5.svg'
import chatgpt4Svg from '~assets/chatgpt4.svg'

const DEFAULT_CONFIG: ChatConfig = {
    token: '',
    customChatGptWebApiUrl: 'https://chat.openai.com',
    customChatGptWebApiPath: '/backend-api/conversation',
    disableWebModeHistory: false,
    chatgptArkoseReqParams: 'cgb=vhwi',
    chatgptArkoseReqUrl: '',
}

const MODELS_DICT = {
    chatgpt35API: { value: 'gpt-3.5-turbo-16k', desc: 'ChatGPT (API)' },
    chatgptFree35: { value: 'text-davinci-002-render-sha', desc: 'ChatGPT (Web)' },
    chatgptPlus4Browsing: { value: 'gpt-4', desc: 'ChatGPT (Web, GPT-4, browsing, analysis, DALL·E)' },
    chatgptPlus4: { value: 'gpt-4-gizmo', desc: 'ChatGPT (Web, GPT-4, ChatGPT Classic)' },
}


const SG_SEARCH_URL = 'https://sg.search.yahoo.com/search'




const MODEL_OPTIONS: ModelOptions[] =
    [{
        key: 'chatgpt35API',
        name: 'ChatGPT (API)',
        description: 'ChatGPT 3.5-turbo (API)',
        mode: 'api',
        icon: chatgpt3_5Svg
    },
    {
        key: 'chatgptFree35',
        name: 'ChatGPT3.5 (Web)',
        description: 'ChatGPT (Web)',
        mode: 'web',
        icon: chatgpt3_5Svg
    },
    {
        key: 'chatgptPlus4Browsing',
        name: 'ChatGPT4 (Web)',
        description: 'ChatGPT (Web)',
        mode: 'web',
        icon: chatgpt4Svg
    },
    {
        key: 'chatgptPlus4',
        name: 'GPTs (Web)',
        description: 'GPTs (Web)',
        mode: 'web',
        icon: chatgpt4Svg
    }

    ]

const DEFAULT_MODEL = MODEL_OPTIONS.find((model) => model.key === 'chatgptFree35')!


export const chatgptWebModelKeys = [
    'chatgptFree35',
    'chatgptPlus4',
    'chatgptPlus4Browsing',
]

export {
    DEFAULT_CONFIG,
    MODELS_DICT,
    SG_SEARCH_URL,
    MODEL_OPTIONS,
    DEFAULT_MODEL
}

