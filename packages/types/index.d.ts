

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


interface Config {
	token: string;
	customChatGptWebApiUrl: string;
	customChatGptWebApiPath: string;
	disableWebModeHistory: boolean;
	chatgptArkoseReqParams: string;
	chatgptArkoseReqUrl?: string;
	chatgptArkoseReqForm?: string;
}

type ModelKey = 'chatgpt35API' | 'chatgptFree35' | 'chatgptPlus4' | 'chatgptPlus4Browsing'

interface ModelOptions {
	key: ModelKey;
	name: string;
	description: string;
	mode: 'api' | 'web';
}





export * from './gizmo';
export * from './ui';
export * from './chat';
export {
	Log,
	GPTInfo,
	UploadGPTInfo,
	Window,
	Config,
	Gpts,
	Session,
	ModelOptions,
	ModelKey,

}