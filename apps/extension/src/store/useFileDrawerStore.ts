import { create } from "zustand"

interface FileDrawer {
    chatId: string;
    isVisible: boolean;
}


interface FileDrawerState {
    fileDrawers: FileDrawer[];
}

interface FileDrawerActions {
    showFileDrawer: (chatId: string) => void;
    hideFileDrawer: (chatId: string) => void;
}
type FileDrawerStore = FileDrawerState & FileDrawerActions;

const useFileDrawerStore = create<FileDrawerStore>()(set => ({
    fileDrawers: [],
    showFileDrawer: (chatId) => set(state => {
        const newFileDrawers = [...state.fileDrawers];
        const index = newFileDrawers.findIndex(fileDrawer => fileDrawer.chatId === chatId);

        if (index === -1) {
            // 如果 chatId 不存在，添加新的抽屉
            newFileDrawers.push({ chatId, isVisible: true });
        } else {
            // 如果 chatId 存在，更新其可见性
            newFileDrawers[index].isVisible = true;
        }

        return { fileDrawers: newFileDrawers };
    }),
    hideFileDrawer: (chatId) => set(state => {
        const newFileDrawers = state.fileDrawers.map(fileDrawer =>
            fileDrawer.chatId === chatId ? { ...fileDrawer, isVisible: false } : fileDrawer
        );

        return { fileDrawers: newFileDrawers };
    }),
}));


export default useFileDrawerStore