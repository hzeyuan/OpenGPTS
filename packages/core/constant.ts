import type { ChatConfig, ModelKey, OpenGPTsConfig } from '@opengpts/types'


const WEBSITE_URL = 'https://open-gpts.vercel.app'
const SG_SEARCH_URL = 'https://sg.search.yahoo.com/search'


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
    mode: 'ChatGPT webapp',
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
    chatgptWebModelKeys,
    DEFAULT_CONFIG,
    CHATGPT_WEBAPPP_DEFAULT_CONFIG,
    WEBSITE_URL,
    SG_SEARCH_URL,
    OPENAI_BASE_URL,
    OpenGPTS_BASE_URL
}