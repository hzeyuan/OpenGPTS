import type { ChatConfig, ModelKey } from '@opengpts/types'


const WEBSITE_URL = 'https://open-gpts.vercel.app'


const MODELS_DICT: Record<ModelKey, { value: string, desc: string }> = {
    chatgpt35API: { value: 'gpt-3.5-turbo-16k', desc: 'ChatGPT 3.5 turbo(API)' },
    chatgptFree35: { value: 'text-davinci-002-render-sha', desc: 'ChatGPT (Web)' },
    chatgptPlus4Browsing: { value: 'gpt-4', desc: 'ChatGPT (Web, GPT-4, browsing, analysis, DALL·E)' },
    chatgptPlus4: { value: 'gpt-4-gizmo', desc: 'ChatGPT (Web, GPT-4, ChatGPT Classic)' },
}


const DEFAULT_CONFIG: ChatConfig = {
    token: '',
    customChatGptWebApiUrl: 'https://chat.openai.com',
    customChatGptWebApiPath: '/backend-api/conversation',
    disableWebModeHistory: false,
    chatgptArkoseReqParams: 'cgb=vhwi',
    chatgptArkoseReqUrl: '',
}

const chatgptWebModelKeys = [
    'chatgptFree35',
    'chatgptPlus4Browsing',
    'chatgptPlus4'
]

export {
    chatgptWebModelKeys,
    MODELS_DICT,
    DEFAULT_CONFIG,
    WEBSITE_URL
}