import WorkflowDetailsCard from './WorkflowDetailsCard';
import WorkflowEditor, { type WorkflowEditorHandles } from '../WorkflowEditor';
import { useRef } from 'react';
import { Play } from 'lucide-react';


const WorkflowLayout = () => {

    const workflowEditorRef = useRef<WorkflowEditorHandles>(null);
    return (
        <div className='flex'
            style={{ height: 'calc(100vh - 56px)' }}
        >
            <WorkflowDetailsCard />
            <div className="relative flex-1 overflow-auto">
                {/* <div
                    className="absolute top-0 left-0 z-10 flex items-center w-full p-4 pointer-events-none"
                >
                    <div className='flex justify-between w-full'>
                        <div></div>
                        <div className="flex items-center p-1 ml-4 bg-white rounded-lg pointer-events-auto ui-card dark:bg-gray-800">
                            <div className="flex items-center justify-center p-2 rounded-lg cursor-pointer hoverable">
                                <Play size="20" />
                            </div>
                           
                        </div>

                    </div>
                </div> */}
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