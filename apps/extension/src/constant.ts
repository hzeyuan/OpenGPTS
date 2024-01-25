import type { Config } from "@repo/types"

const defaultConfig: Config = {
    customChatGptWebApiUrl: 'https://chat.openai.com',
    customChatGptWebApiPath: '/backend-api/conversation',
    disableWebModeHistory: false,
    chatgptArkoseReqParams: 'cgb=vhwi',
    chatgptArkoseReqUrl: '',
}

const Models = {
    chatgptFree35: { value: 'text-davinci-002-render-sha', desc: 'ChatGPT (Web)' },
    chatgptPlus4Browsing: { value: 'gpt-4', desc: 'ChatGPT (Web, GPT-4, browsing, analysis, DALL·E)' },
    chatgptPlus4: { value: 'gpt-4-gizmo', desc: 'ChatGPT (Web, GPT-4, ChatGPT Classic)' },

}




export const chatgptWebModelKeys = [
    'chatgptFree35',
    'chatgptPlus4',
    // 'chatgptFree35Mobile',
    'chatgptPlus4Browsing',
    // 'chatgptPlus4Mobile',
]

export {
    defaultConfig,
    Models
}

