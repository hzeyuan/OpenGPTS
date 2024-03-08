import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { create } from "zustand";



type WorkflowState = {
    workflowData: PRAWorkflow.WorkflowData | null;
    setWorkflowData: (workflowData: PRAWorkflow.WorkflowData) => void;
    updateWorkflowData: (updateData: Partial<PRAWorkflow.WorkflowData>) => void; // Add the type definition for the updateWorkflowData function
};

export const useWorkflowStore = create<WorkflowState>(set => ({
    workflowData: null,
    setWorkflowData: (workflowData: PRAWorkflow.WorkflowData) => {
        set({ workflowData })
    },
    updateWorkflowData: (updateData: Partial<PRAWorkflow.WorkflowData>) => {

        set((state) => ({
            workflowData: {
                ...state.workflowData!,
                ...updateData,
            },
        }));
    },
}));
