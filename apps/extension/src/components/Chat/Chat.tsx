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
import type { ChatRequest, FunctionCallHandler } from "ai";
import type { OMessage, Session } from "@opengpts/types";
import { MessagesList } from "../Message/MessageList";
import type { MessagesListMethods } from "../Message/MessageList";
import { useChatStore } from "~src/store/useChatStore";
import { ofetch } from "ofetch";
import useChatQuoteStore from "~src/store/useChatQuoteStore";
import { useChatPanelContext } from "../Panel/ChatPanel";
import useScreenCapture from "~src/store/useScreenCapture";
import { useTranslation } from "react-i18next";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import { MODELS_DICT } from "~src/constant";
import { OpenAI } from "@opengpts/core";
import { useDebouncedCallback } from "use-debounce";
export type ChatProps = {
    ref: RefObject<any>;
    uiMessages?: any[];
    systemMessage?: string;
    children?: any;
    className?: string;
};

export type ChatRef = {};

const apiMapping = {
    get_current_weather: {
        url: "http://localhost:1337/api/fn-api/get_current_weather",
    },
    dalle3: {
        url: "http://localhost:1337/api/fn-api/dalle3",
    },
};

export const Chat = forwardRef<ChatRef, ChatProps>(
    ({ uiMessages = [], systemMessage = "你好有什么我可以帮助你的么？", children = "", className = "" }, ref) => {
        const [content, setContent] = useState<string>("");
        const { mention, setMention, command, setCommand, setModel, chatId, setChatId, model, webAccess, setFileList } =
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
        const functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
            console.log("正在调用插件", functionCall.name, "参数为：", functionCall.arguments);
            console.log("chatMessages", chatMessages);
            // according to functionCall.name to call api
            // TODO:fetch apiMapping from server
            const apiInfo = apiMapping[functionCall.name as string];
            let message: OMessage;
            const functionCallMessage = chatMessages.find((message) => {
                const fnCall = message.function_call;
                return typeof fnCall === "object" && fnCall && fnCall.name! === functionCall.name;
            });

            if (!apiInfo) {
                return {
                    messages: [
                        ...chatMessages,
                        {
                            id: functionCallMessage?.id || nanoid(),
                            name: functionCall.name,
                            role: "function" as const,
                            isError: true,
                            content: JSON.stringify({
                                error: "未找到该函数",
                            }),
                        },
                    ],
                };
            }
            try {
                const content = await ofetch(apiInfo.url, {
                    method: "POST",
                    body: JSON.stringify({ args: functionCall.arguments }),
                    timeout: 30000,
                });
                console.log("content", content);
                message = {
                    id: functionCallMessage?.id || nanoid(),
                    name: functionCall.name,
                    role: "function" as const,
                    content: content,
                };
            } catch (error) {
                console.error("Error processing API request:", error);
                // return handleApiFunctionError(functionCall, error);
                message = {
                    id: functionCallMessage?.id || nanoid(),
                    name: functionCall.name,
                    role: "function" as const,
                    isError: true,
                    content: JSON.stringify({
                        error: error.message,
                    }),
                };
            }
            const functionResponse: ChatRequest = {
                messages: [...chatMessages, message],
            };
            console.log("functionResponse", functionResponse);
            return functionResponse;
        };

        const { webConfig, setWebConfig, mode, setMode, input, isLoading, stop, append, messages, setMessages } = useChat({
            initMode: "web",
            api: "http://127.0.0.1:1337/api/chat",
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
                }
                console.log("useChat", error);
                // setError(error.message)
                // alert(error.message)
            },
            onResponse: (response) => {
                handleScrollToBottom();
            },
            onFinish: async (message: OMessage, session?: Session, conversation?: OpenAI["conversation"]) => {
                // clear mentions
                setMention(undefined);
                if (!session) return;
                const chatMessages = getChatMessages(chatId);
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
                if (mode === "web") {
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
                    addChatIfNotExist(chat);
                    addChatMessage(chatId, message);
                }
            },
            body: {
                modelName: model.key,
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
            setMessages([...messages, message]);
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

            const options = {};

            function handleGPTsOptions(mention) {
                const gizmoId = _.get(mention, "key", "");
                if (!gizmoId) throw new Error("gizmo_id is required");
                return { gizmoId, ...webConfig };
            }

            // Helper function to handle web mode options
            function handleWebModeOptions(chatId) {
                return checkChatExist(chatId) ? { conversationId: chatId } : {};
            }

            // Helper function to handle default options
            function handleDefaultOptions(modelKey, capturedImage) {
                const modelName = MODELS_DICT[modelKey].value;
                return { model: modelName, imgUrl: capturedImage };
            }
            let bodyOptions = {};

            if (mention && mentionType === "GPTs") {
                bodyOptions = handleGPTsOptions(mention);
            } else {
                bodyOptions =
                    model.mode === "web"
                        ? handleWebModeOptions(chatId)
                        : handleDefaultOptions(model.key, useScreenCapture.getState().capturedImage);
            }

            options["body"] = { modelName: modelKey, ...bodyOptions };

            append(
                {
                    ...message,
                    content: `${selection}
            ${webSearchPrompt}
            ${content}`,
                },
                {
                    options,
                },
                {
                    mention: mention ?? {
                        name: model.name,
                        icon: model.icon,
                    },
                }
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

        const handleHideInputArea = () => { };

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

        useEffect(() => {
            // const model = MODELS.find(({ name }) => name === model.key)
            console.log("设置模型为", model?.key);
            if (model) {
                setMode(model.mode);
            }
        }, [model]);

        useEffect(() => {
            const messages = getChatMessages(chatId);
            console.log("messages", messages);
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
