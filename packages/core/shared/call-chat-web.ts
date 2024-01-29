import type { ChatRequest, IdGenerator, JSONValue, Message } from 'ai';
import { OpenAI, StreamEvent } from '../web/openai';
import type { ChatConfig, Session } from '@opengpts/types';

export async function callChatWeb({
  callMethod,
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
}: {
  callMethod: OpenAI['gpt']['call']; // The provided call function
  messages: Message[];
  body: Record<string, any>;
  abortController?: () => AbortController | null;
  restoreMessagesOnFailure: () => void;
  appendMessage: (message: Message) => void;
  onResponse?: (response: Response) => void | Promise<void>;
  onUpdate: (merged: Message[], data: JSONValue[] | undefined) => void;
  onFinish?: (message: Message, session?: any, conversation?: OpenAI['conversation']) => void;
  generateId: IdGenerator;
  webConfig?: ChatConfig
}) {

  const createdAt = new Date();
  const replyId = generateId();
  let responseMessage: Message = {
    id: replyId,
    createdAt,
    content: '',
    role: 'assistant',
  };


  // Convert messages and body to a suitable format for the call method
  let session: Session = {
    question: messages[messages.length - 1].content,
    modelName: 'chatgptFree35',
    parentMessageId: messages[messages.length - 1]?.id,
    ...body,
  };

  console.log('session',session)
  appendMessage({ ...responseMessage });

  // Define event handlers based on the callChatApi structure
  let event: StreamEvent = {
    onStart: () => {

    },
    onMessage: ({ text, imagePointers }: {
      done: boolean,
      session: Session,
      text: string
      imagePointers?: string[]
    }) => {

      responseMessage['content'] = text;
      appendMessage({ ...responseMessage });

    },
    onFinish: ({ conversation }) => {
      responseMessage['id'] = session.messageId!
      onFinish && onFinish(responseMessage, session, conversation);
    },
    onError: (resp: Response | Error) => { },
    onAbort: () => { }
  };


  try {
    await callMethod(session, event, webConfig);


    return responseMessage;
  } catch (error) {
    restoreMessagesOnFailure();
    throw error;
  }
}
