import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useSWR, { type KeyedMutator } from 'swr';
import { callChatApi } from '../../shared/call-chat-api';
import { callChatWeb } from '../../shared/call-chat-web';
import { processChatStream } from '../../shared/process-chat-stream';
import { nanoid } from '~shared/utils';

import type { ChatRequestOptions, CreateMessage, IdGenerator, JSONValue, ReactResponseRow, UseChatOptions, experimental_StreamingReactResponse } from 'ai';
import type { Message } from 'ai';
import type { ChatConfig, Mention, Mode, OChatRequest, OFunctionCallHandler, OMessage } from '@opengpts/types';

import { OpenAI } from '../utils/web/openai';
import { callChatApiKey } from '../../shared/call-chat-apiKey';
export type { CreateMessage, Message, UseChatOptions };

export type UseChatHelpers = {
  /** Current messages in the chat */
  messages: OMessage[];
  /** The error object of the API request */
  error: undefined | Error;
  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   * @param message The message to append
   * @param options Additional options to pass to the API call
   */
  append: (
    message: OMessage | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
    config?: any
  ) => Promise<string | null | undefined>;
  /**
   * Reload the last AI chat response for the given chat history. If the last
   * message isn't from the assistant, it will request the API to generate a
   * new response.
   */
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop: () => void;
  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (messages: OMessage[]) => void;
  /** The current value of the input */
  input: string;
  /** setState-powered method to update the input value */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /** An input/textarea-ready onChange handler to control the value of the input */
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  /** Form submission handler to automatically reset input and append a user message  */
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  metadata?: Object;
  /** Whether the API request is in progress */
  isLoading: boolean;
  /** Additional data added on the server via StreamData */
  data?: JSONValue[] | undefined;
};

type StreamingReactResponseAction = (payload: {
  messages: OMessage[];
  data?: Record<string, string>;
}) => Promise<experimental_StreamingReactResponse>;

const getStreamedResponse = async (
  api: string | StreamingReactResponseAction,
  chatRequest: OChatRequest,
  mutate: KeyedMutator<OMessage[]>,
  mutateStreamData: KeyedMutator<JSONValue[] | undefined>,
  existingData: JSONValue[] | undefined,
  extraMetadataRef: React.MutableRefObject<any>,
  messagesRef: React.MutableRefObject<OMessage[]>,
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  generateId: IdGenerator,
  onFinish: (message: OMessage, session?: any, conversation?: OpenAI['conversation']) => Promise<void>,
  onResponse: (response: Response) => Promise<void>,
  sendExtraMessageFields?: boolean,
  mode?: Mode,
  webConfig?: ChatConfig,
  messageConfig: any = {}
) => {
  // Do an optimistic update to the chat state to show the updated messages
  // immediately.
  const previousMessages = messagesRef.current;
  mutate(chatRequest.messages, false);

  const constructedMessagesPayload = sendExtraMessageFields
    ? chatRequest.messages
    : chatRequest.messages.map(({ role, content, name, function_call, id }) => ({
      id,
      role,
      content,
      ...(name !== undefined && { name }),
      ...(function_call !== undefined && {
        function_call: function_call,
      }),
    }));

  if (typeof api !== 'string') {
    // In this case, we are handling a Server Action. No complex mode handling needed.

    const replyId = generateId();
    const createdAt = new Date();
    let responseMessage: OMessage = {
      id: replyId,
      createdAt,
      display: {
        name: messageConfig?.mention?.name || 'AI',
        icon: messageConfig?.mention?.icon
      },
      content: '',
      role: 'assistant',
    };


    async function readRow(promise: Promise<ReactResponseRow>) {
      const { content, ui, next } = await promise;

      // TODO: Handle function calls.
      responseMessage['content'] = content;
      responseMessage['ui'] = await ui;
      console.log('chatRequest.messages', chatRequest.messages)
      mutate([...chatRequest.messages, { ...responseMessage }], false);

      if (next) {
        await readRow(next);
      }
    }

    try {
      const promise = api({
        messages: constructedMessagesPayload as OMessage[],
        data: chatRequest.data,
      }) as Promise<ReactResponseRow>;
      await readRow(promise);
    } catch (e) {
      // Restore the previous messages if the request fails.
      mutate(previousMessages, false);
      throw e;
    }

    if (onFinish) {
      console.log('next', [...chatRequest.messages, { ...responseMessage }])
      onFinish(responseMessage);
    }

    return responseMessage;
  }

  const callParams = {
    api,
    messages: constructedMessagesPayload,
    body: {
      data: chatRequest.data,
      ...extraMetadataRef.current.body,
      ...chatRequest.options?.body,
      ...(chatRequest.functions !== undefined && {
        functions: chatRequest.functions,
      }),
      ...(chatRequest.function_call !== undefined && {
        function_call: chatRequest.function_call,
      }),
    },
    abortController: () => abortControllerRef.current,
    appendMessage(message: OMessage) {
      mutate([...chatRequest.messages, message], false);
    },
    restoreMessagesOnFailure() {
      mutate(previousMessages, false);
    },
    onResponse,
    onUpdate(merged: OMessage[], data: JSONValue[] | undefined) {
      mutate([...chatRequest.messages, ...merged], false);
      mutateStreamData([...(existingData || []), ...(data || [])], false);
    },
    onFinish,
    generateId,
  }

  if (mode === 'ChatGPT webapp') {
    const openai = new OpenAI({ token: webConfig?.token });
    return callChatWeb({
      callLLm: openai.gpt.call.bind(openai.gpt),
      ...callParams,
      webConfig,
      messageConfig,
    });
  } else if (mode === 'OpenAI API') {
    return callChatApiKey({
      ...callParams,
      messageConfig,
    });
  }
  return callChatApi({
    ...callParams,
    messageConfig,
  })
};

export function useChat({
  api = '/api/chat',
  id,
  initialMessages,
  initialInput = '',
  sendExtraMessageFields,
  experimental_onFunctionCall,
  onResponse,
  onFinish,
  onError,
  credentials,
  headers,
  body,
  generateId = nanoid,
  initMode = 'ChatGPT webapp',
  initialWebConfig = {}
}: Omit<UseChatOptions, 'onFinish' | 'onError'> & {
  key?: string;
  initMode?: Mode
  initialWebConfig?: any;
  onFinish?: (message: OMessage, session?: any, conversation?: OpenAI['conversation']) => Promise<void>;
  onError?: (error: Error, updateMessage: (messageInfo: Partial<OMessage>) => void) => void;
} = {}): UseChatHelpers & {
  // experimental_onFunctionCall: OFunctionCallHandler;
  mode: Mode;
  webConfig: any;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setWebConfig: React.Dispatch<React.SetStateAction<string>>;


} {
  // Generate a unique id for the chat if not provided.
  const hookId = useId();
  const idKey = id ?? hookId;
  const chatKey = typeof api === 'string' ? [api, idKey] : idKey;

  // Store a empty array as the initial messages
  // (instead of using a default parameter value that gets re-created each time)
  // to avoid re-renders:

  const [initialMessagesFallback] = useState([]);
  const [mode, setMode] = useState<Mode>(initMode)
  const [webConfig, setWebConfig] = useState<any>(initialWebConfig)
  // Store the chat state in SWR, using the chatId as the key to share states.
  const { data: messages, mutate } = useSWR<OMessage[]>(
    [chatKey, 'messages'],
    null,
    { fallbackData: initialMessages ?? initialMessagesFallback },
  );

  // We store loading state in another hook to sync loading states across hook invocations
  const { data: isLoading = false, mutate: mutateLoading } = useSWR<boolean>(
    [chatKey, 'loading'],
    null,
  );

  const { data: streamData, mutate: mutateStreamData } = useSWR<
    JSONValue[] | undefined
  >([chatKey, 'streamData'], null);

  const { data: error = undefined, mutate: setError } = useSWR<
    undefined | Error
  >([chatKey, 'error'], null);

  // Keep the latest messages in a ref.
  const messagesRef = useRef<OMessage[]>(messages || []);
  useEffect(() => {
    messagesRef.current = messages || [];
  }, [messages]);


  // Abort controller to cancel the current API call.
  const abortControllerRef = useRef<AbortController | null>(null);

  const extraMetadataRef = useRef({
    credentials,
    headers,
    body,
  });

  useEffect(() => {
    extraMetadataRef.current = {
      credentials,
      headers,
      body,
    };
  }, [credentials, headers, body]);

  /**
   * Trigger the API call to fetch the assistant's response.
   * zh: 触发 API 调用以获取助手的响应。
   */
  const triggerRequest = useCallback(
    async (chatRequest: OChatRequest, messageConfig?: any) => {
      try {
        mutateLoading(true);
        setError(undefined);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        await processChatStream({
          getStreamedResponse: () =>
            getStreamedResponse(
              api,
              chatRequest,
              mutate,
              mutateStreamData,
              streamData!,
              extraMetadataRef,
              messagesRef,
              abortControllerRef,
              generateId,
              // @ts-ignore
              onFinish,
              onResponse,
              sendExtraMessageFields,
              mode,
              webConfig,
              messageConfig
            ),
          // @ts-ignore
          experimental_onFunctionCall,
          updateChatRequest: chatRequestParam => {
            if (chatRequestParam) chatRequest = chatRequestParam as OChatRequest
          },
          getCurrentMessages: () => messagesRef.current,
        });

        abortControllerRef.current = null;
      } catch (error) {

        // Ignore abort errors as they are expected.
        if ((error as any).name === 'AbortError') {
          abortControllerRef.current = null;
          return null;
        }

        if (error instanceof Error) {
          let newMessage = {
            id: generateId(),
            createdAt: new Date(),
            content: error.message,
            role: 'assistant',
            isError: true,
          } as OMessage

          const updateMessage = (messageInfo: Partial<OMessage>) => {
            newMessage = {
              ...newMessage,
              ...messageInfo
            }
          }
          onError && onError(error, updateMessage);

          const newMessages = [...messagesRef.current, newMessage];
          mutate(newMessages, false);
          console.error(`[useChat] ${error.message}`)
          setError(error as Error);
        }



      } finally {
        mutateLoading(false);
      }
    },
    [
      mutate,
      mutateLoading,
      api,
      extraMetadataRef,
      onResponse,
      onFinish,
      onError,
      setError,
      mutateStreamData,
      streamData,
      sendExtraMessageFields,
      experimental_onFunctionCall,
      messagesRef,
      abortControllerRef,
      generateId,
      mode,
      webConfig,
    ],
  );

  const append = useCallback(
    async (
      message: OMessage | CreateMessage,
      { options, functions, function_call, data }: ChatRequestOptions = {},
      config = {} as { mention?: Mention }
    ) => {
      if (!message.id) {
        message.id = generateId();
      }

      // Append the  user message to the list of messages.
      const newMessages = [...messagesRef.current, message as OMessage];
      // setMessages(newMessages)
      mutate(newMessages, false);

      const chatRequest: OChatRequest = {
        messages: newMessages,
        options,
        data,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call }),
      };

      return triggerRequest(chatRequest, config);
    },
    [triggerRequest, generateId],
  );

  const reload = useCallback(
    async ({ options, functions, function_call }: ChatRequestOptions = {}) => {
      if (messagesRef.current.length === 0) return null;

      // Remove last assistant message and retry last user message.
      const lastMessage = messagesRef.current[messagesRef.current.length - 1];
      if (lastMessage.role === 'assistant') {
        const chatRequest: OChatRequest = {
          messages: messagesRef.current.slice(0, -1),
          options,
          ...(functions !== undefined && { functions }),
          ...(function_call !== undefined && { function_call }),
        };

        return triggerRequest(chatRequest);
      }

      const chatRequest: OChatRequest = {
        messages: messagesRef.current,
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call }),
      };

      return triggerRequest(chatRequest);
    },
    [triggerRequest],
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const setMessages = useCallback(
    (messages: OMessage[]) => {
      mutate(messages, false);
      messagesRef.current = messages;
    },
    [mutate],
  );

  // Input state and handlers.
  const [input, setInput] = useState(initialInput);




  const handleSubmit = useCallback(
    (
      e: React.FormEvent<HTMLFormElement>,
      options: ChatRequestOptions = {},
      metadata?: Object,
    ) => {
      if (metadata) {
        extraMetadataRef.current = {
          ...extraMetadataRef.current,
          ...metadata,
        };
      }

      e.preventDefault();
      if (!input) return;
      append(
        {
          content: input,
          role: 'user',
          createdAt: new Date(),
        },
        options,
      );
      setInput('');
    },
    [input, append],
  );

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  return {
    webConfig,
    setWebConfig,
    mode,
    setMode,
    messages: messages || [],
    error,
    append,
    reload,
    stop,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    data: streamData,
  };
}