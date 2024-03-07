import { create } from "zustand";

type WorkflowState = {
    workflow: any;
};

export const useWorkflowStore = create<WorkflowState>(set => ({
    workflow: null,
    updateWorkflow: (workflow: any) => {
        set({ workflow })
    },
}));
