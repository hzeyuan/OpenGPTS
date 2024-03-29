import { motion } from "framer-motion";
import Panel from "~src/components/Panels/Panel"
import { Chat } from "../Chat/Chat";
import { Button, Tooltip, type UploadFile } from "antd";
import { forwardRef, useImperativeHandle, useState, useRef, createContext, useContext, type Dispatch, type SetStateAction, useEffect } from "react";
// import { ChatHistoryDrawer } from "../Chat/ChatHistoryDrawer"
// import { FileDrawer } from "../FileDrawer";
import { nanoid } from "~shared/utils"
import { useChatStore } from "~src/store/useChatStore";
import { useTranslation } from "react-i18next";
import { DEFAULT_MODEL, MODEL_OPTIONS,DEFAULT_CONFIG } from "~src/constant";
import { Storage } from "@plasmohq/storage"
import { PlusOutlined } from "@ant-design/icons";
import type { Mention, ModelOptions, OCommand, OpenGPTsConfig, ToolRow } from "@opengpts/types";
import { ChatHistoryDrawer } from "../Chat/ChatHistoryDrawer";
import { useStorage } from "@plasmohq/storage/hook";

interface ChatContextType {
    chatId: string;
    setChatId: Dispatch<SetStateAction<string>>;
    model: ModelOptions;
    setModel: (model: ModelOptions) => void;
    webAccess: boolean;
    setWebAccess: (webAccess: boolean) => void;
    fileList: UploadFile[];
    setFileList: (fileList: UploadFile[]) => void;
    command?: OCommand;
    setCommand: (command?: OCommand) => void;
    setMention: (mention?: Mention) => void;
    mention?: Mention;
    useTools: ToolRow[];
    setUseTools: (useTools: ToolRow[]) => void;
}


const defaultContextValue: ChatContextType = {
    chatId: '',
    setChatId: () => { }, // 空函数作为初始设置器,
    model: DEFAULT_MODEL,
    setModel: (model: ModelOptions) => { },
    webAccess: false,
    setWebAccess: (webAccess: boolean) => { },
    fileList: [],
    setFileList: (fileList: any[]) => { },
    setCommand: (command?: OCommand) => { },
    setMention: (mention?: Mention) => { },
    useTools: [],
    setUseTools: (useTools: ToolRow[]) => { },
};


// 创建 Context
const ChatPanelContext = createContext<ChatContextType>(defaultContextValue)!;

export const useChatPanelContext = () => useContext(ChatPanelContext);



interface ChatPanelProps {
    chatId: string;
}
export interface ChatPanelRef {
    handleSubmit: () => void;
    onInputChange: (v: string) => void;
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ chatId: initialChatId }, ref) => {

    const [chatId, setChatId] = useState(initialChatId);
    const [model, setModel] = useState<ModelOptions>(DEFAULT_MODEL);
    const [webAccess, setWebAccess] = useState<boolean>(false);
    const [command, setCommand] = useState<OCommand>()
    const [mention, setMention] = useState<Mention>()
    const [useTools, setUseTools] = useState<ToolRow[]>([])
    const [fileList, setFileList] = useState<any[]>([])
    const chatRef = useRef<any>();
    const { t } = useTranslation();
    const updateChatId = useChatStore(state => state.updateChatId)
    const [config] = useStorage<OpenGPTsConfig>({
        key: "opengptsConfig",
        instance: new Storage({
            area: "local",
            allCopied: true,
        }),
    }, (v) =>v  || DEFAULT_CONFIG)

    const handleCreateNewChat = () => {
        const chatId = nanoid()
        updateChatId(chatId)
        setChatId(chatId)
        setCommand(undefined)
    }

    // if change opengpts mode from config, update model that first match the mode
    useEffect(() => {
        const model = MODEL_OPTIONS.find(({ modes }) => modes.indexOf(config?.mode) !== -1)
        setModel(model || DEFAULT_MODEL)
    }, [config?.mode])

    useImperativeHandle(ref, () => ({
        // submit
        handleSubmit: () => {
            chatRef.current.handleSubmit()
        },
        // control panel input value
        onInputChange: (v: string) => {
            chatRef.current.onInputChange(v)
        },
        setHideInputArea: (bool: boolean) => {
            chatRef.current.setHideInputArea(bool)
        }
    }));


    return (
        <ChatPanelContext.Provider value={{
            chatId, setChatId,
            model,
            setModel,
            webAccess, setWebAccess,
            fileList, setFileList,
            command, setCommand,
            setMention, mention,
            useTools, setUseTools
        }}>
            <motion.div
                className="h-full"
                style={{ maxHeight: 'calc(100vh - 42px)', minHeight: 'calc(50vh - 30px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Panel title={<Tooltip title={t('ChatToolTips')}>{t('Chat')}</Tooltip>} action={
                    <Button icon={<PlusOutlined />} onClick={handleCreateNewChat} type="text"> {t('Add')}</Button>
                }>
                    <div
                        className="flex-1 w-full h-full overflow-y-auto tab-container"
                    >
                        <div className="relative h-full text-sm query-chat-panel" >
                            <Chat ref={chatRef} systemMessage="How can I help you today?" />
                            <ChatHistoryDrawer chatId={chatId!} />
                            {/* <FileDrawer chatId={chatId!} ></FileDrawer> */}
                        </div>
                    </div>
                </Panel>
            </motion.div>
        </ChatPanelContext.Provider>
    )
});



export default ChatPanel;