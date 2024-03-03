import { SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody } from './rpa/rpa';


export type ResponseBody = SendToBackgroundViaRelayResponseBody

interface Session {
	question: string;
	autoClean?: boolean;
	conversationId?: string;
	conversationRecords?: any[];
	messageId?: string;
	parentMessageId?: string;
	modelName: ModelKey;
	gizmoId?: string;
}

interface Gpts {
	uuid: string;
	org_id: string;
	name: string;
	description: string;
	avatar_url: string;
	short_url: string;
	author_id: string;
	author_name: string;
	created_at: string;
	updated_at: string;
	detail?: any;
	visit_url?: string;
	rating?: number;
	is_recommended?: boolean;
}



interface Log {
	time: string;
	action: string;
	description: string;
}

interface GPTInfo {
	title: string;
	url: string;
	intro: string;
	start_text: string;
	prompts: string[];
	openai_url: string;
	capabilities: string[][];
	prompt: string;
	image_url: string;
	from?: string;
	created_at?: string;
	status?: string;
	error?: string;
	link?: string;
	logs?: Log[];
	tabId: string;
}



interface UploadGPTInfo {
	title: string;
	url: string;
	intro: string;
	start_text: string;
	prompts: string[];
	openai_url: string;
	capabilities: string[][];
	prompt: string;
	image_url: string;

}


interface Window {
	relay: {
		description: string
		tryRelay: () => Promise<string>
	}
	clientHub: {
		description: string
		connect: () => void
		send: (message: string) => void
		port?: chrome.runtime.Port
	}
}


interface ChatConfig {
	token: string;
	customChatGptWebApiUrl: string;
	customChatGptWebApiPath: string;
	disableWebModeHistory: boolean;
	chatgptArkoseReqParams: string;
	chatgptArkoseReqUrl?: string;
	chatgptArkoseReqForm?: string;
}

type Mode = 'ChatGPT webapp' | 'OpenAI API' | "OpenGPTs"

type ModelKey = 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-16k-0613' | 'gpt-3.5-turbo-16k' | 'gpt-3.5'
	| 'gpt-3.5-0613' | 'gpt-3.5-turbo-1106' | 'gpt-3.5-turbo-instruct' | 'gpt-3.5-turbo-instruct-0914'
	| 'gpt-4-0125-preview' | 'gpt-4-1106-preview' | 'gpt-4' | 'gpt-4-0613' | 'gpt-4-32k' | 'gpt-4-32k-0613'
	| 'ChatGPT3.5 Turbo' | 'ChatGPT4 Turbo'  //opengpts
	| 'chatgptFree35' | 'chatgptPlus4Browsing' | 'chatgptPlus4' // web 



type OpenGPTsConfig = {
	mode: Mode;
	apiKey: string;
	baseUrl: string;
	isProxy: boolean;
}

interface ModelOptions {
	key: ModelKey;
	icon?: string;
	name: string;
	description?: string;
	modes: Mode[];
}



interface CommonResponse {
	code: number;
	message: string;
	data?: Record<string, any>;
}



export * from './gizmo';
export * from './ui';
export * from './chat';
export * from './database';
export * from './tools';
export * from './rpa/rpa';
export * from './rpa/env';
export * from './rpa/observe';
export * from './rpa/thought';
export * from './rpa/action';
export * from './rpa/workflow';
export {
	Log,
	GPTInfo,
	UploadGPTInfo,
	Window,
	ChatConfig,
	Gpts,
	Session,
	ModelOptions,
	ModelKey,
	Mode,
	OpenGPTsConfig,
	CommonResponse
}