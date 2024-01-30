import type { Gizmo } from "@opengpts/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import _ from "lodash";

interface GPTsStore {
    gptsList: Gizmo[];
    getFavoriteGPTsList: () => Gizmo[];
    setGPTsList: (gptsList: Gizmo[]) => void;
    updateGPTs: (gpt: Gizmo) => void;
}

const useGPTStore = create<GPTsStore>()(
    persist(
        (set, get) => ({
            gptsList: [],
            setGPTsList: (gptsList: Gizmo[]) => set({ gptsList: [...gptsList] }),
            getFavoriteGPTsList: () => get().gptsList.filter((gpt) => gpt.is_favorite),
            updateGPTs: (gpt: Gizmo) => {
                const gptsList = get().gptsList;
                const updatedGptsList = gptsList.map(item =>
                    item.id === gpt.id ? gpt : item
                );

                set({ gptsList: updatedGptsList });
            }
        }),
        {
            name: 'gpts-storage',
            partialize: (state) => ({
                gptsList: state.gptsList,
            }),
        },
    )
)

export default useGPTStore;