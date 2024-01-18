// store.ts
import { create } from "zustand";

type RootNodeState = {
  rootNode: HTMLElement | null;
  setRootNode: (node: HTMLElement | null) => void;
};

export const useRootNodeStore = create<RootNodeState>(set => ({
  rootNode: null,
  setRootNode: (node: HTMLElement | null) => set({ rootNode: node }),
}));
