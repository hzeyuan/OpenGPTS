import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RPAFlow = {
    // 这里应该有一个block的临时执行数据
    blocksContext: {
        [key: string]: any;
    };
    workflow?: PRAWorkflow.WorkflowData;
    workflowList: PRAWorkflow.WorkflowData[];
    addWorkflow: (workflow: Partial<PRAWorkflow.WorkflowData>) => void;
    updateWorkflow: (workflow: Partial<PRAWorkflow.WorkflowData>) => void;
    // updateBlock: (block: Partial<PRAWorkflow.BlockData>) => void;
    delete: (workflowId: string) => void;
    findOne: (workflowId: string) => PRAWorkflow.WorkflowData | undefined;
    set: (workflowList: PRAWorkflow.WorkflowData[]) => void;
    setWorkflow: (workflow: PRAWorkflow.WorkflowData) => void;

}


const useRPAFlowStore = create<RPAFlow>()(
    persist(
        (set, get) => ({
            blocksContext: {},
            workflow: undefined,
            workflowList: [],
            updateWorkflow: (workflow) => {
                set((state) => {
                    const newWorkflow = { ...state.workflow, ...workflow };
                    state.workflow = {
                        ...newWorkflow,
                    } as PRAWorkflow.WorkflowData;
                    return state;
                });
            },
            set: (workflowList) => {
                set((state) => {
                    state.workflowList = [...workflowList];
                    return state;
                })
            },
            delete: (workflowId) => {
                set((state) => {
                    state.workflowList = state.workflowList.filter((item) => item.id !== workflowId);
                    return state;
                })
            },
            findOne: (workflowId) => {
                const workflowData = get().workflowList.find((item) => item.id === workflowId);
                return workflowData;
            },
            addWorkflow: (workflow: Partial<PRAWorkflow.WorkflowData>) => {
                set((state) => {
                    state.workflowList = [
                        ...state.workflowList,
                        workflow
                    ]
                    return state;
                }
                )
            },
            // updateBlock: (block) => {
            //     set((state) => {
            //         const newWorkflow = { ...state.workflow };
            //         const nodes = newWorkflow.drawflow?.nodes
            //         if (nodes) {
            //             const node = nodes.find((item) => item.id === block.id);
            //             if (node) {
            //                 node.data = { ...node.data, ...block };
            //             }
            //         }
            //         state.workflow = {
            //             ...newWorkflow,
            //         } as PRAWorkflow.WorkflowData;
            //         return state;
            //     })
            // },
            setWorkflow: (workflow) => {
                set((state) => {
                    state.workflow = { ...workflow };
                    return state;
                })
            },
        }),
        {
            name: 'rpa-flow-store',
            partialize: (state) => ({
                // workflowList: state.workflowList,
                workflow: state.workflow
            })
        }

    )
)

export default useRPAFlowStore;
