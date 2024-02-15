import type { ChatRequest, IdGenerator, JSONValue, Message } from 'ai';
import { OpenAI, type APIkeyStreamEvent } from '../src/utils/web/openai';
import type { ChatConfig, OMessage } from '@opengpts/types';

export async function callChatApiKey({
  messages,
  body,
  abortController,
  appendMessage,
  restoreMessagesOnFailure,
  onResponse,
  onUpdate,
  onFinish,
  generateId,
  webConfig,
  messageConfig
}: {
  messages: OMessage[];
  body: Record<string, any>;
  abortController?: () => AbortController | null;
  restoreMessagesOnFailure: () => void;
  appendMessage: (message: OMessage) => void;
  onResponse?: (response: Response) => void | Promise<void>;
  onUpdate: (merged: OMessage[], data: JSONValue[] | undefined) => void;
  onFinish?: (message: OMessage) => void;
  generateId: IdGenerator;
  webConfig?: ChatConfig
  messageConfig?: any
}) {

  const createdAt = new Date();
  const replyId = generateId();
  let responseMessage: OMessage = {
    id: replyId,
    createdAt,
    content: '',
    role: 'assistant',
    display: {
      name: messageConfig?.mention?.name || 'AI',
      icon: messageConfig?.mention?.icon
    },
  };


  appendMessage({ ...responseMessage });

  // Define event handlers based on the callChatApi structure
  let event: APIkeyStreamEvent = {
    onStart: () => {

    },
    onMessage: ({ text, imagePointers, done }: {
      done: boolean,
      text: string
      imagePointers?: string[]
    }) => {
      responseMessage['content'] = text;
      appendMessage({ ...responseMessage });
    },
    onFinish: () => {
      onFinish && onFinish(responseMessage);
    },
    onError: (error: Error) => {
      // restoreMessagesOnFailure()
    },
    onAbort: () => { }
  };

  const apiKey = body?.data?.apiKey;
  const baseUrl = body?.data?.baseUrl;

  await OpenAI.callWithApiKey({
    event,
    apiKey,
    baseUrl,
    request: {
      controller: abortController?.(),
      body: {
        messages: body.messages,
        model: body.model,
        stream: true,
      }
    }
  }).catch(err => {
    if (err.message === 'noChatGPTPlusArkoseToken') return;
    restoreMessagesOnFailure();
    throw err;
  })
  return responseMessage;

}
