
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
	// 可以添加更多字段，如创建时间等
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
	customChatGptWebApiUrl: string;
	customChatGptWebApiPath: string;
	disableWebModeHistory: boolean;
	chatgptArkoseReqParams: string;
	chatgptArkoseReqUrl?: string;
	chatgptArkoseReqForm?: string;
}

export * from './gizmo';

export {
	Log,
	GPTInfo,
	UploadGPTInfo,
	Window,
	Config,
	Gpts

}