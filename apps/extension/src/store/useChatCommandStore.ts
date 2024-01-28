// useCommand.ts
import { create } from "zustand";
import type { OCommand } from "@opengpts/types";

// 定义状态和操作
interface CommandState {
  commands: {
    chatId: string;
    command?: OCommand;
  }[];
  setCommand: (chatId: string, command?: OCommand) => void;
  getCommand: (chatId: string) => OCommand | undefined;
}

// 使用 create 方法创建一个 zustand store
const useChatCommandStore = create<CommandState>((set, get) => ({
  commands: [], // 初始命令 ID 状态
  getCommand: (chatId) => {
    const { commands } = get();
    if (!commands) return;
    const index = commands?.findIndex((item) => item.chatId === chatId);
    if (index !== -1) {
      return commands[index].command;
    }
    return undefined;
  },
  setCommand: (chatId: string, command?: OCommand) => {
    set(state => {
      const existingIndex = state.commands?.findIndex(entry => entry.chatId === chatId);
      if (existingIndex !== -1) {
        // 如果找到了相应的 chatId，更新 command
        const updatedCommands = [...state.commands];
        updatedCommands[existingIndex] = { ...updatedCommands[existingIndex], command };
        return { commands: updatedCommands };
      } else {
        // 如果没有找到，添加新的引用
        return { commands: [...state.commands, { chatId, command }] };
      }
    });

  }, // 更新状态的方法
}));

export default useChatCommandStore;
