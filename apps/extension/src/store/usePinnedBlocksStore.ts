import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type pinnedBlocks = {
    blocks: PRAWorkflow.Block[];
    upsert: (block: PRAWorkflow.Block) => void;
    delete:(blockId:string) =>void
}

const usePinnedBlocksStore = create<pinnedBlocks>()(
    persist(
        (set) => ({
            blocks: [],
            upsert: (block) => {
                set((state) => {
                    const index = state.blocks.findIndex((b) => b.id === block.id);
                    if (index === -1) {
                        return { blocks: [...state.blocks, block] };
                    } else {
                        const newBlocks = [...state.blocks];
                        newBlocks[index] = block;
                        return { blocks: newBlocks };
                    }
                });
            },
            delete:(id)=>{
                set((state)=>{
                    const newBlocks = state.blocks.filter(b=>b.id!==id)
                    return {blocks:newBlocks}
                })   
            }
        }),
        {
            name: 'pinnedBlocksStore',
        }
    )
)




export default usePinnedBlocksStore;
