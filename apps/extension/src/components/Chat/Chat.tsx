import { useChat } from "@opengpts/core/@react";
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject, forwardRef } from "react";
import { ChatInputArea } from "./ChatInputArea";
import logoIcon from "data-base64:~assets/icon.png"
import { nanoid } from "@opengpts/core/shared/utils";
import { motion } from "framer-motion";
import useUserSelection from "~src/hooks/useUserSelection";
import _ from "lodash";
// import InteractivePanel from "../InteractivePanel"
import { webSearch, type SearchRequest } from "~src/contents/web-search";
import { PauseCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ChatRequest, FunctionCallHandler, Message } from "ai";
import type { OFunctionCallHandler, OMessage, OpenGPTsConfig, Session } from "@opengpts/types";
import { MessagesList } from "../Message/MessageList";
import type { MessagesListMethods } from "../Message/MessageList";
import { useChatStore } from "~src/store/useChatStore";
import useChatQuoteStore from "~src/store/useChatQuoteStore";
import { useChatPanelContext } from "../Panel/ChatPanel";
import useScreenCapture from "~src/store/useScreenCapture";
import { useTranslation } from "react-i18next";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import { OpenAI } from "@opengpts/core";
import { useDebouncedCallback } from "use-debounce";
import { OPENAI_BASE_URL, OpenGPTS_BASE_URL } from "@opengpts/core/constant";
import { convertToolToApiDescription, sendHttpRequest, transformMessages } from "@opengpts/core/utils";
import { callTool, getTool } from "~src/app/services/tools";
export type ChatProps = {
    ref: RefObject<any>;
    uiMessages?: any[];
    systemMessage?: string;
    children?: any;
    className?: string;
};

export type ChatRef = {};


export const Chat = forwardRef<ChatRef, ChatProps>(
    ({ uiMessages = [], systemMessage = "你好有什么我可以帮助你的么？", children = "", className = "" }, ref) => {
        const [content, setContent] = useState<string>("");
        const { mention, setMention, useTools, setUseTools, command, setCommand, setModel, chatId, setChatId, model, webAccess, setFileList } =
            useChatPanelContext();
        const [hideInputArea, setHideInputArea] = useState(false);
        const messagesListRef = useRef<MessagesListMethods>(null);
        const inputRef = useRef<any>(null);

        const { selection } = useUserSelection();
        const { resetCapture } = useScreenCapture();
        const [setCloseSelectionTextPanel] = useState(true);
        const { t } = useTranslation();
        const checkChatExist = useChatStore((state) => state.checkChatExist);
        const getChatMessages = useChatStore((state) => state.getChatMessages);
        const addChatMessage = useChatStore((state) => state.addChatMessage);
        const getQuoteMessage = useChatQuoteStore((state) => state.getQuote);
        const addChatIfNotExist = useChatStore((state) => state.addChatIfNotExist);
        const [chatgptConfig] = useStorage({
            key: "chatgpt-config",
            instance: new Storage({
                area: "local",
            }),
        });
        const [opengptsConfig] = useStorage<OpenGPTsConfig>({
            key: "opengptsConfig",
            instance: new Storage({
                area: "local",
            }),
        });

        /**
         * Creates a function call message.
         * @param previousMessage The previous message.
         * @param functionCall The function call.
         * @param toolInfo The tool information.
         * @param status The status of the function call.
         * @param content The content of the message.
         * @returns The created message.
         */
        function createFunctionCallMessage(previousMessage, functionCall, toolInfo, status, content = ''): OMessage {
            return {
                id: previousMessage?.id || nanoid(),
                name: functionCall.name,
                role: "function",
                content: content,
                data: {
                    ...toolInfo,
                    requestPayload: functionCall.arguments,
                    requestResponse: content,
                    status: status
                },
            };
        }


        /**
         * Creates an error message for a function call.
         * @param previousMessage The previous message.
         * @param functionCall The function call.
         * @param error The error object.
         * @returns The error message.
         */
        function createErrorFunctionCallMessage(previousMessage, functionCall, error): OMessage {
            return {
                id: previousMessage?.id || nanoid(),
                name: functionCall.name,
                role: "function",
                isError: true,
                content: JSON.stringify({ error: error.message }),
                data: {
                    status: 'error'
                },
            };
        }
        const functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
            if (!functionCall.name) throw new Error('functionCall.name is required')

            console.log("正在调用插件", functionCall.name, "参数为：", functionCall.arguments);
            console.log("chatMessages", chatMessages);

            /**
             * tips:here need to find the last function call message  
             * because the chatMessages maybe has more than one function call message,we need to find the last one
             */
            const functionCallMessage = _.findLast(chatMessages, message => _.get(message, 'function_call.name') === functionCall.name);
            // get tool info from server
            const toolInfo = await getTool(functionCall.name);
            let newMessage = createFunctionCallMessage(functionCallMessage, functionCall, toolInfo, 'running');


            if (functionCallMessage) {
                setMessages(chatMessages.map(message => message.id === newMessage.id ? newMessage : message));
                addChatMessage(chatId, newMessage);
            }

            try {
                const content = await callTool(functionCall.name, JSON.parse(functionCall?.arguments || '{}'))
                console.debug('call tool get result', content)

                newMessage = createFunctionCallMessage(newMessage, functionCall, toolInfo, 'finished', content);
                addChatMessage(chatId, newMessage)
            } catch (error) {
                console.error("Error processing API request:", error);
                newMessage = createErrorFunctionCallMessage(newMessage, functionCall, error);
            }
            const functionResponse = { messages: [...chatMessages, newMessage], };
            console.debug("functionResponse", functionResponse);
            return functionResponse as { messages: Message[] };
        };

        const { webConfig, setWebConfig, mode, setMode, input, isLoading, stop, append, messages, setMessages } = useChat({
            initMode: opengptsConfig?.mode,
            api: "http://127.0.0.1:1947/api/chat",
            experimental_onFunctionCall: functionCallHandler,
            credentials: "omit",
            initialMessages: [],
            initialInput: "",
            onError: (error, updateMessage) => {
                if (error.message === "Request timed out") {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("NetworkApplication")}
                                    <span className="text-[12px] ml-1 text-[var(--gpts-primary-color)]">
                                        ({t("NetworkUnstableRequestFailed")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("DueToOpenAILimitation")}</div>
                            </div>
                        ),
                    });
                } else if (error.message === "noChatGPTPlusArkoseToken") {
                    updateMessage({
                        content: (
                            <>
                                <div className="label">
                                    <div className="radio-title">
                                        {t("NetworkApplication")}
                                        <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                            ({t("GPT4AndGPTsCallFailed")})
                                        </span>
                                    </div>
                                    <div className="radio-desc">{t("VisitChatOpenAIPage")}</div>
                                </div>
                            </>
                        ),
                    });
                } else if (error.message == "chatGPT403") {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("NetworkApplication")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ( {t("ChatGPTPlusUsersCanTry")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("DueToOpenAILimitation")}</div>
                            </div>
                        ),
                    });
                } else if (error.message == "chatGPT429") {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("NetworkApplication")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ({t("OpenAIRestrictedYourRequestFrequency")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("CheckLimitOverage")}</div>
                            </div>
                        ),
                    });
                } else if (error.message == "chatGPT400") {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("NetworkApplication")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ({t("OpenAIRequestFailed")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("GPTsUnavailableOrDeleted")}</div>
                            </div>
                        ),
                    });
                } else if (error.message === 'chatGPT404') {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("NetworkApplication")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ({t("OpenAIRequestFailed")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("DueToOpenAILimitation")}</div>
                            </div>
                        ),
                    });
                } else if (error.message === 'APIKeyInvalid') {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("APIKeyInvalidTitle")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ({t("APIKeyInvalidTip")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("APIKeyInvalidDesc")}</div>
                            </div>
                        ),
                    });
                } else if (error.message === 'baseUrl404') {
                    updateMessage({
                        content: (
                            <div className="label">
                                <div className="radio-title">
                                    {t("BaseURLErrorTitle")}
                                    <span className="text-[12px] ml-1 text-[var(--opengpts-primary-color)]">
                                        ({t("BaseURLErrorTip")})
                                    </span>
                                </div>
                                <div className="radio-desc">{t("BaseURLErrorDesc")}</div>
                            </div>
                        ),
                    });
                }
                // setError(error.message)
            },
            onResponse: (response) => {
                handleScrollToBottom();
            },
            onFinish: async (message: OMessage, session?: Session, conversation?: OpenAI["conversation"]) => {
                // clear mentions
                setMention(undefined);
                const chatMessages = getChatMessages(chatId);

                if (mode === 'ChatGPT webapp') {
                    if (!session) return;
                    const chat = {
                        chatId: session.conversationId,
                        title: chatMessages[0].content,
                        latestReply: message.content,
                        created_at: new Date().getTime(),
                        updated_at: new Date().getTime(),
                        latestRecord: {
                            message: {
                                // id: session.messageId,
                                ...message,
                            },
                        },
                        fileList: [],
                    };
                    const newChatId = session.conversationId!;
                    if (!checkChatExist(chatId)) {
                        if (typeof chatMessages[0].content !== "string") return;
                        const initialTitle = chatMessages[0].content.slice(0, 30);
                        chat["chatId"] = newChatId;
                        setChatId(newChatId);
                        addChatIfNotExist(chat);
                        addChatMessage(newChatId, chatMessages[0]);
                        addChatMessage(newChatId, message);
                        if (conversation) conversation.updateTitle(newChatId, initialTitle);
                    } else {
                        addChatMessage(newChatId, message);
                    }
                } else {
                    const chat = {
                        chatId,
                        title: chatMessages[0].content,
                        latestReply: message.content,
                        created_at: new Date().getTime(),
                        updated_at: new Date().getTime(),
                        latestRecord: {
                            message: { ...message, },
                        },
                        fileList: [],
                    };
                    addChatIfNotExist(chat);
                    addChatMessage(chatId, message);
                }
            },
            body: {
                model: model.key,
            },
            sendExtraMessageFields: true,
            initialWebConfig: {
                ...chatgptConfig,
            },
        });

        const handleSubmit = async ({ content }) => {
            if (!content) return;
            let webSearchPrompt = "";
            //TODO: use model that was mentioned last, if not exist, use default model, temporarily
            const mentionType = _.get(mention, "type", "");
            const modelKey = mentionType === "GPTs" ? "gpt-4-gizmo" : mention?.key ?? model.key;
            console.log('modelKey', modelKey)
            const quoteMessage = getQuoteMessage(chatId);
            const capturedImage = useScreenCapture.getState().capturedImage;

            const message: OMessage = {
                id: nanoid(),
                content: `${selection}
            ${content}`,
                role: "user",
                display: {
                    name: "Me",
                    icon: "",
                },
                quoteMessage: quoteMessage,
                images: capturedImage ? [capturedImage] : [],
                command,
                ui: quoteMessage?.content,
            };

            const newMessages = [...messages, message]
            if (webAccess) {
                try {
                    const searchRequest: SearchRequest = {
                        query: content,
                        timerange: "",
                        region: "",
                    };
                    const webSearchResults = await webSearch(searchRequest, 3);

                    //merge webSearchResults
                    console.log("webSearchResults", webSearchResults);
                    webSearchPrompt =
                        "# 搜索到一些相关的内容:" +
                        webSearchResults.map((result) => {
                            return `
                        ### ${result.title}
                        > ${result.body}
                        [查看更多](${result.url}) 
                    `;
                        });
                } catch (error) {
                    console.error(`webSearch error:${error}`);
                }
            }

            addChatMessage(chatId, message);
            setFileList([]);

            const chatRequestOptions = { body: {}, headers: {} };
            const chatRequestData = {};
            let bodyOptions = {};

            switch (opengptsConfig.mode) {
                case 'OpenAI API':
                    chatRequestOptions.headers['Authorization'] = `Bearer ${opengptsConfig.apiKey}`;
                    chatRequestOptions['body'] = {
                        model: modelKey,
                        messages: transformMessages([
                            {
                                id: nanoid(),
                                role: 'system',
                                content: '你好有什么我可以帮助你的么？',
                            },
                            ...newMessages
                        ]),
                        stream: true,
                    }
                    chatRequestData['apiKey'] = opengptsConfig.apiKey;
                    chatRequestData['baseUrl'] = `${opengptsConfig?.isProxy ? opengptsConfig.baseUrl : OPENAI_BASE_URL}/chat/completions`;
                    console.log('options', chatRequestOptions['body'])
                    break;
                case 'OpenGPTs':
                    // : ChatCompletioCreateParams.Function[]
                    // const functions = [
                    //     {
                    //         name: 'get_current_weather',
                    //         description: 'Get the current weather',
                    //         parameters: {
                    //             type: 'object',
                    //             properties: {
                    //                 location: {
                    //                     type: 'string',
                    //                     description: 'The city and state, e.g. San Francisco, CA',
                    //                 },
                    //                 format: {
                    //                     type: 'string',
                    //                     enum: ['celsius', 'fahrenheit'],
                    //                     description:
                    //                         'The temperature unit to use. Infer this from the users location.',
                    //                 },
                    //             },
                    //             required: ['location', 'format'],
                    //         },
                    //     },
                    // ];
                    // convertToolToApiDescription(useTools);
                    const functions = useTools.map((tool) => convertToolToApiDescription(tool))
                    chatRequestOptions["body"] = { model: modelKey, messages: newMessages, functions };
                    break;
                case 'ChatGPT webapp':
                    chatRequestOptions['body'] = {
                        model: modelKey,
                        // gizmoId: mention?.key,
                        ...webConfig
                    }
                    // function handleWebModeOptions(chatId) {
                    //     return checkChatExist(chatId) ? { conversationId: chatId } : {};
                    // }

                    // function handleDefaultOptions(modelKey, capturedImage) {
                    //     return { model: modelKey, imgUrl: capturedImage };
                    // }

                    // function handleGPTsOptions(mention) {
                    //     if (!mention || !mention.key) throw new Error("gizmo_id is required");
                    //     return { gizmoId: mention.key, ...webConfig };
                    // }

                    // 如果是ChatGPT webapp模式，同时mention

                    // if (mention && mentionType === "GPTs") {
                    //     bodyOptions = handleGPTsOptions(mention);
                    // } else {
                    //     bodyOptions =
                    //         model.modes.indexOf("ChatGPT webapp") !== -1
                    //             ? handleWebModeOptions(chatId)
                    //             : handleDefaultOptions(model.key, useScreenCapture.getState().capturedImage);
                    // }

                    // if (!mention || !mention.key) throw new Error("gizmo_id is required");
                    // options['body'] = {
                    //     model: modelKey,
                    //     gizmoId: mention?.key,
                    //     ...webConfig
                    // }
                    // options["body"] = {
                    //     model: modelKey,
                    //     gizmoId: mention?.key,
                    //     ...webConfig
                    // };
                    // 设置ChatGPT webapp特定的头部，如果有的话
                    break;
                default:
                // 处理默认或未知模式
            }

            append(
                {
                    ...message,
                    // ${selection}
                    content: `${webSearchPrompt}/n${content}`.trim(),
                },
                { options: chatRequestOptions, data: chatRequestData },
                { mention: mention ?? { name: model.name, icon: model.icon }, }
            );

            setContent("");
            setMention(undefined);
            setCommand(undefined);
            handleScrollToBottom();
            resetCapture();
        };

        const handleScrollToBottom = useDebouncedCallback(() => {
            if (messagesListRef.current) {
                messagesListRef.current.scrollToBottom();
            }
        }, 300);

        const onInputChange = (v: string) => {
            inputRef.current.setContent(v);
            setContent(v);
        };

        useImperativeHandle(ref, () => {
            return {
                handleSubmit: () => inputRef.current.submit(),
                handleScrollToBottom: handleScrollToBottom,
                onInputChange: onInputChange,
                setHideInputArea: setHideInputArea,
            };
        });

        useEffect(() => {
            console.log("selection", selection);
            if (selection.length > 0) {
                // setCloseSelectionTextPanel(false)
            }
        }, [selection]);
        useEffect(() => {
            if (isLoading) {
                handleScrollToBottom();
            }
        }, [messages]);

        // useEffect(() => {
        //     console.log('change', opengptsConfig?.mode)
        //     if (opengptsConfig?.mode === 'OpenGPTs') {
        //         setRequestApi(OpenGPTS_BASE_URL)
        //     } else if (opengptsConfig?.mode === 'OpenAI API') {
        //         console.log('opengptsConfig', opengptsConfig)
        //         setRequestApi(`${opengptsConfig.baseUrl || OPENAI_BASE_URL}/chat/completions`)
        //     }
        // }, [opengptsConfig?.mode, opengptsConfig?.baseUrl])


        useEffect(() => {
            setMode(opengptsConfig?.mode)
        }, [opengptsConfig?.mode]);

        useEffect(() => {
            const messages = getChatMessages(chatId);
            setMessages(messages);
        }, [chatId]);

        useEffect(() => {
            console.log("chatgptConfig", chatgptConfig);
            setWebConfig({ ...chatgptConfig });
        }, [chatgptConfig]);

        return (
            <>
                <div className={`${className} flex flex-col h-full`}>
                    <div className="flex-1 pt-6 pl-4 pr-4 overflow-y-auto chat-list custom-scrollbar pb-9">
                        {/* <InteractivePanel
                        isVisible={!closeSelectionTextPanel}
                        onClose={() => setCloseSelectionTextPanel(true)}
                        title={t('Select Text')}
                        description={selection}
                        className='overflow-scroll max-h-64'></InteractivePanel> */}
                        {messages.length > 0 ? (
                            <MessagesList chatId={chatId} ref={messagesListRef} uiMessages={uiMessages} messages={messages} />
                        ) : (
                            <div
                                style={{
                                    transform: "translateY(calc(-50% - 92px)",
                                }}
                                className=" absolute left-0 right-0  top-[50%]">
                                <div className="mb-5">
                                    <div className="flex flex-col items-center">
                                        <div className="flex justify-center items-center size-[60px] rounded-full bg-[white] shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                                            <img
                                                src={logoIcon}
                                                className=" size-[40px]"
                                            />
                                        </div>
                                        <div className="mt-[12px] font-semibold text-[18px]">我今天能帮你什么？</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {isLoading && (
                        <motion.div
                            className="relative m-auto bottom-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button onClick={stop} type="primary" className="flex items-center justify-center">
                                <PauseCircleOutlined />
                                <span>{t("Stop")}</span>
                            </Button>
                        </motion.div>
                    )}

                    <motion.div
                        className="input-box"
                        animate={hideInputArea ? "hidden" : "visible"}
                        variants={{
                            hidden: { opacity: 0, height: 0, overflow: "hidden" },
                            visible: { opacity: 1, height: "auto" },
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        <ChatInputArea
                            chatId={chatId}
                            ref={inputRef}
                            onSubmit={handleSubmit}
                            onInputChange={onInputChange}
                            content={content}
                        />
                    </motion.div>
                </div>
            </>
        );
    }
);


