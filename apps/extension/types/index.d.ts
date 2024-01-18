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
	from ?: string;
	created_at?: string;
	status?: string;
	error?: string;
	link?: string;
	logs?: Log[];
	tabId: string;
	// 可以添加更多字段，如创建时间等
}

interface GPTsStats {
	count: number;
	gpts: {
		[key: string]: GPTInfo;
	};
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
  