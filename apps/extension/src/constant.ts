import type { Config, ModelOptions } from "@opengpts/types"

const DEFAULT_CONFIG: Config = {
    token:'',
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
        description: 'ChatGPT (API)',
        mode: 'api',
    },
    {
        key: 'chatgptFree35',
        name: 'ChatGPT3.5 (Web)',
        description: 'ChatGPT (Web)',
        mode: 'web'
    },
    {
        key: 'chatgptPlus4Browsing',
        name: 'ChatGPT4 (Web)',
        description: 'ChatGPT (Web)',
        mode: 'web'
    },
    {
        key: 'chatgptPlus4',
        name: 'GPTs (Web)',
        description: 'GPTs (Web)',
        mode: 'web'
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

