import _ from "lodash";
import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware'
import type { Chat, OMessage } from "@opengpts/types";
interface ChatState {
    curChatId: string;
    chatList: Chat[];

    chatListMessages: any;

}

interface ChatActions {
    updateChatId: (chatId: string) => void;
    getChatMessages: (chatId: string) => OMessage[];
    getChatFileList: () => any[];
    checkChatExist: (chatId: string) => boolean;
    addChatIfNotExist: (chat: any) => void;
    addChatMessage: (chatId: string, message: OMessage) => void;
    addChatFile: (chatId: string, file: any) => void;
    deleteChatFile: (chatId: string, fileId: string) => void;
    updateSome: (chatId: string, chat: any) => void;
    deleteChat: (chatId: string) => void;
}

type ChatStore = ChatState & ChatActions;



const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            curChatId: '',
            chatList: [],
            chatListMessages: {},
            checkChatExist: (chatId: string) => {
                const chatList = get().chatList
                const chatIdExists = chatList.some((item) => {
                    return item.chatId === chatId
                })
                return chatIdExists
            },
            getChatMessages: (chatId) => get().chatListMessages[chatId],
            getChatFileList: () => {
                const chatList = get().chatList;
                const chatIndex = _.findIndex(chatList, { chatId: get().curChatId });
                if (chatIndex !== -1) {
                    return _.get(chatList, `[${chatIndex}].fileList`, []);
                }
                return [];
            },
            updateChatId: (chatId: string) => set({ curChatId: chatId }),
            addChatIfNotExist: async (chat: any) => {
                const chatList = get().chatList
                const chatIdExists = chatList.some((item) => {
                    return item.chatId === chat.chatId
                })
                if (!chatIdExists) {
                    chatList.push(chat)
                    set({ chatList })
                }
            },
            addChatMessage: (chatId: string, message: OMessage) => {
                const chatListMessages = get().chatListMessages
                const messages = chatListMessages[chatId] || []
                messages.push(message)
                chatListMessages[chatId] = messages
                set({ chatListMessages })
            },
            addChatFile: (chatId: string, file: any) => {
                const chatList = get().chatList;
                const chatIndex = _.findIndex(chatList, { chatId: chatId });

                if (chatIndex !== -1) {
                    // 获取现有的 fileList，如果不存在则初始化为空数组
                    const fileList = _.get(chatList, `[${chatIndex}].fileList`, []);

                    // 创建更新后的 fileList
                    const updatedFileList = [...fileList, file];

                    // 使用 lodash 的 _.set 来更新 chatList
                    _.set(chatList, `[${chatIndex}].fileList`, updatedFileList);

                    // 更新状态
                    set({ chatList });
                }

            },
            deleteChatFile: (chatId: string, fileId: string) => {
                const chatList = get().chatList;
                const chatIndex = _.findIndex(chatList, { chatId: chatId });

                if (chatIndex !== -1) {
                    // 获取现有的 fileList，如果不存在则初始化为空数组
                    const fileList: Chat['fileList'] = _.get(chatList, `[${chatIndex}].fileList`, []);

                    // 创建更新后的 fileList
                    const updatedFileList = fileList?.filter((item) => {
                        return item.uid !== fileId
                    });

                    // 使用 lodash 的 _.set 来更新 chatList
                    _.set(chatList, `[${chatIndex}].fileList`, updatedFileList);

                    // 更新状态
                    set({ chatList });
                }
            },
            updateSome: (chatId: string, chat: any) => {
                const chatList = get().chatList
                const chatIdExists = chatList.some((item) => {
                    return item.chatId === chatId
                })
                if (chatIdExists) {
                    chatList.forEach((item) => {
                        if (item.chatId === chatId) {
                            item = {
                                ...item,
                                ...chat
                            }
                        }
                    })
                    set({ chatList })
                }

            },
            updateChatMessage: (chatId: string, message: OMessage) => {
                const chatListMessages = get().chatListMessages
                const messages = chatListMessages[chatId] || []
                messages.forEach((item) => {
                    if (item.id === message.id) {
                        item = message
                    }
                })
                chatListMessages[chatId] = messages
                set({ chatListMessages })
            },
            deleteChat: (chatId: string) => {
                const chatList = get().chatList
                const chatIdExists = chatList.some((item) => {
                    return item.chatId === chatId
                })
                if (chatIdExists) {
                    const newChatList = chatList.filter((item) => {
                        return item.chatId !== chatId
                    })
                    const chatListMessages = get().chatListMessages
                    delete chatListMessages[chatId]
                    set({ chatList: newChatList, chatListMessages })
                }
            },
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                chatList: state.chatList,
                chatListMessages: state.chatListMessages,
            }),
        },
    ),
)

export {
    useChatStore
}
