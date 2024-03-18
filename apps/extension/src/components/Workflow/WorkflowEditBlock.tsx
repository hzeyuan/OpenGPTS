import React, { forwardRef, useState, useEffect, useMemo, useImperativeHandle } from 'react';
import EditInteractionBase from './Edit/EditInteractionBase';
import EditNewTab from './Edit/EditNewTab';
import EditForms from './Edit/EditForms';
import EditScrollElement from './Edit/EditScrollElement';
import EditTakeScreenshot from './Edit/EditTakeScreenshot';
import Drawer from 'antd/es/drawer';
import { useCallback } from 'react';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import type { Node } from 'reactflow';
import EditDelay from './Edit/EditDelay';
import EditGetText from './Edit/EditGetText';
import EditExportData from './Edit/EditExportData'



const editComponents: { [key: string]: React.ElementType } = {
    'EditInteractionBase': EditInteractionBase,
    'EditNewTab': EditNewTab,
    'EditForms': EditForms,
    'EditTakeScreenshot': EditTakeScreenshot,
    'EditScrollElement': EditScrollElement,
    'EditDelay': EditDelay,
    'EditGetText': EditGetText,
    'EditExportData':EditExportData
}

const WorkflowEditBlock = forwardRef<{
    setOpen: (open: boolean) => void;
}, {
    node?: Node<PRAWorkflow.Block>;
    editor: any;
    workflow: any;
    autocomplete: boolean;
    onUpdate: (node: Node<PRAWorkflow.Block>) => void;

}>(({ node, editor, workflow, autocomplete, onUpdate }, ref) => {

    const [blockData, setBlockData] = useState(node?.data);

    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        setOpen
    }))

    useEffect(() => {
        setBlockData(node?.data)
    }, [node])

    const EditComponent = useMemo(() => {
        const editCompKey = blockData?.editComponent;
        if (!editCompKey) return null;

        const EditComp = editComponents?.[editCompKey] || null;
        return EditComp;
    }, [blockData?.editComponent]);

    // 使用 React 效果来处理任何副作用或生命周期事件
    useEffect(() => {
        // 假设你需要在组件挂载或更新时执行某些操作
    }, [node, editor, workflow, autocomplete]); // 依赖项数组

    const onClose = () => {
        setOpen(false)
    }
    const onUpdate2 = useCallback((blockData: PRAWorkflow.Block['data']) => {
        console.log(node, 'nodeData', blockData)
        const newNode = {
            ...node,
            data: {
                ...node?.data,
                data: {
                    ...node?.data.data,
                    ...blockData,
                }
            }
        } as Node<PRAWorkflow.Block>;
        onUpdate(newNode)
    }, [node, onUpdate])

    return (
        <Drawer
            id="workflow-edit-block"
            title={blockData?.name}
            placement={'right'}
            destroyOnClose={true}
            mask={false}
            onClose={onClose}
            open={open}
        >
            {/* {JSON.stringify(node)} */}

            {EditComponent &&
                <EditComponent
                    initialData={blockData?.data}
                    onUpdate={onUpdate2}
                    nodeId={node?.id}
                />
            }
        </Drawer>
    );

})

export default WorkflowEditBlock;
