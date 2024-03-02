import WorkflowDetailsCard from './WorkflowDetailsCard';
import WorkflowEditor, { type WorkflowEditorHandles } from '../WorkflowEditor';
import { useRef } from 'react';


const WorkflowLayout = () => {

    const workflowEditorRef = useRef<WorkflowEditorHandles>(null);

    return (
        <div className='flex'
            style={{ height: 'calc(100vh - 56px)' }}
        >
            <WorkflowDetailsCard />
            <div className="relative flex-1 overflow-auto">
                {/* 顶层的图标 */}
                <div
                    className="absolute top-0 left-0 z-10 flex items-center w-full p-4 pointer-events-none"
                >


                </div>
                {/* 主要容器 */}
                {/* ui-tab-panels */}
                <WorkflowEditor
                    ref={workflowEditorRef}
                />
            </div>
        </div>
    );
}

export default WorkflowLayout;