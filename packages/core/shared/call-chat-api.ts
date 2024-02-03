import { StreamingTextResponse, type FunctionCall, type IdGenerator, type JSONValue, type Message, OpenAIStream } from 'ai';
import { parseComplexResponse } from './parse-complex-response';
import { COMPLEX_HEADER, createChunkDecoder } from './utils';
import { OMessage } from '@opengpts/types';

export async function callChatApi({
  api,
  messages,
  body,
  credentials,
  headers,
  abortController,
  appendMessage,
  restoreMessagesOnFailure,
  onResponse,
  onUpdate,
  onFinish,
  generateId,
  messageConfig
}: {
  api: string,
  messages: Omit<Message, 'id'>[];
  body: Record<string, any>;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  abortController?: () => AbortController | null;
  restoreMessagesOnFailure: () => void;
  appendMessage: (message: OMessage) => void;
  onResponse?: (response: Response) => Promise<void>;
  onUpdate: (merged: OMessage[], data: JSONValue[] | undefined) => void;
  onFinish?: (message: OMessage) => Promise<void>;
  generateId: IdGenerator;
  messageConfig?: any
}) {

  // -------为了在请求前显示 loading，先添加一个 loading 的消息
  // 
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
    }
  };
  // ------------------------------------v
  appendMessage({ ...responseMessage });

  const response = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({
      messages,
      ...body,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal: abortController?.()?.signal,
    credentials,
  }).catch(err => {
    restoreMessagesOnFailure();
    throw err;
  });

  if (onResponse) {
    try {
      await onResponse(response);
    } catch (err) {
      throw err;
    }
  }

  console.log('call-chat-api response', response)

  if (!response.ok) {
    restoreMessagesOnFailure();
    throw new Error(
      (await response.text()) || 'Failed to fetch the chat response.',
    );
  }

  if (!response.body) {
    throw new Error('The response body is empty.');
  }

  const reader = response.body.getReader();
  const isComplexMode = response.headers.get(COMPLEX_HEADER) === 'true';

  if (isComplexMode) {

    // appendMessage({ id: tmpLoadingId, createdAt: new Date(), content: '', role: 'assistant', deleted: true });
    // onUpdate

    return await parseComplexResponse({
      reader,
      abortControllerRef:
        abortController != null ? { current: abortController() } : undefined,
      update: onUpdate,
      onFinish(prefixMap) {
        if (onFinish && prefixMap.text != null) {
          onFinish(prefixMap.text);
        }
      },
      generateId,
    });
  } else {
    // const createdAt = new Date();
    const decode = createChunkDecoder(false);

    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    let streamedResponse = '';
    // const replyId = generateId();
    // let responseMessage: Message = {
    //   id: replyId,
    //   createdAt,
    //   content: '',
    //   role: 'assistant',
    // };

    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Update the chat state with the new message tokens.
      streamedResponse += decode(value);

      if (streamedResponse.startsWith('{"function_call":')) {
        // While the function call is streaming, it will be a string.
        responseMessage['function_call'] = streamedResponse;
      } else {
        responseMessage['content'] = streamedResponse;
      }

      appendMessage({ ...responseMessage });

      // The request has been aborted, stop reading the stream.
      if (abortController?.() === null) {
        reader.cancel();
        break;
      }
    }

    if (streamedResponse.startsWith('{"function_call":')) {
      // Once the stream is complete, the function call is parsed into an object.
      const parsedFunctionCall: FunctionCall =
        JSON.parse(streamedResponse).function_call;

      responseMessage['function_call'] = parsedFunctionCall;

      appendMessage({ ...responseMessage });
    }

    if (onFinish) {
      onFinish(responseMessage);
    }

    return responseMessage;
  }
}