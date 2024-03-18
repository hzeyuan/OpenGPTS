"use client"
import { Button, Drawer, Input, message } from "antd";
import { useState } from "react";
import useRPAFlowStore from "~src/store/useRPAflowStore";
import { addWorkflowRequest } from '~src/app/services/workflow'
import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { useRouter } from 'next/navigation'
import { nanoid } from "nanoid";

const CreateWorkflowButton = () => {
    const [openWorkflowDrawer, setOpenWorkflowDrawer] = useState(false);
    const [workflowData, setWorkflowData] = useState<Partial<PRAWorkflow.WorkflowData>>({});
    const router = useRouter();
    const addWorkflow = useRPAFlowStore(state => state.addWorkflow);
    const handleNewWorkflow = async () => {
        try {
            console.log('new workflow')
            const workflowId = nanoid();
            const data = await addWorkflowRequest({
                ...workflowData,
                id:workflowId,
            })
            addWorkflow({
                id: workflowId,
                name: workflowData?.name,
                description: workflowData?.description,
                is_public:0,
            });
            router.push(`/rpa/workflow/${workflowId}`)
        } catch (error) {
            message.error('Failed to create workflow');
        }
        setOpenWorkflowDrawer(true);
    }

    const handleCloseWorkflowDrawer = () => {
        setOpenWorkflowDrawer(false);
    }

    return (
        <>
            <Button type="primary" onClick={() => setOpenWorkflowDrawer(true)}>new Workflow</Button>
            <Button onClick={() => setOpenWorkflowDrawer(true)}>Explore Workflow</Button>
            <Drawer
                open={openWorkflowDrawer}
                onClose={handleCloseWorkflowDrawer}
                title="Create Workflow"
                footer={
                    <div className="flex items-center justify-end gap-2">
                        <Button onClick={handleCloseWorkflowDrawer}>Cancel</Button>
                        <Button onClick={handleNewWorkflow} type="primary">Confirm</Button>
                    </div>
                }
            >
                <div className='flex flex-col gap-2'>
                    <div className='mb-2'>名称</div>
                    <Input
                        value={workflowData.name}
                        placeholder="Name"
                        onChange={(e) => {
                            setWorkflowData({ ...workflowData, name: e.target.value })
                        }}
                    />
                    <div className='my-2'>描述</div>
                    <Input.TextArea
                        value={workflowData.description}
                        onChange={(e) => {
                            setWorkflowData({ ...workflowData, description: e.target.value })
                        }}
                        placeholder="Description" />
                </div>
            </Drawer>
        </>
    )
}

export default CreateWorkflowButton;