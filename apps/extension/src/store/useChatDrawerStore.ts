import { create } from "zustand"

interface ChatDrawer {
    chatId: string;
    isVisible: boolean;
}


interface ChatDrawerState {
    chatDrawers: ChatDrawer[];
}

interface ChatDrawerActions {
    showChatDrawer: (chatId: string) => void;
    hideChatDrawer: (chatId: string) => void;
}
type ChatDrawerStore = ChatDrawerState & ChatDrawerActions;

const useChatDrawerStore = create<ChatDrawerStore>()(set => ({
    chatDrawers: [],
    showChatDrawer: (chatId) => set(state => {
        const newChatDrawers = [...state.chatDrawers];
        const index = newChatDrawers.findIndex(chatDrawer => chatDrawer.chatId === chatId);

        if (index === -1) {
            // 如果 chatId 不存在，添加新的抽屉
            newChatDrawers.push({ chatId, isVisible: true });
        } else {
            // 如果 chatId 存在，更新其可见性
            newChatDrawers[index].isVisible = true;
        }

        return { chatDrawers: newChatDrawers };
    }),
    hideChatDrawer: (chatId) => set(state => {
        const newChatDrawers = state.chatDrawers.map(chatDrawer =>
            chatDrawer.chatId === chatId ? { ...chatDrawer, isVisible: false } : chatDrawer
        );

        return { chatDrawers: newChatDrawers };
    }),
}));


export default useChatDrawerStore