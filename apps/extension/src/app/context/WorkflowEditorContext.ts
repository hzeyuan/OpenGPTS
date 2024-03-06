
import React from "react"


const WorkflowEditorContext = React.createContext<{
    executeFromBlock: (blockId: string) => void
}>({
    executeFromBlock: () => null,
})

const useWorkflowEditorContext = () => {
    const context = React.useContext(WorkflowEditorContext)
    if (!context) {
        throw new Error('useWorkflowEditorContext must be used within a WorkflowEditorProvider')
    }
    return context
}

export {
    WorkflowEditorContext,
    useWorkflowEditorContext
}

