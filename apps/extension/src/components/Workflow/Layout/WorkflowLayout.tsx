"use client"
import {Spin}from 'antd';
import WorkflowDetailsCard from './WorkflowDetailsCard';
import WorkflowEditor, { type WorkflowEditorHandles } from '../WorkflowEditor';
import { useRef, useState } from 'react';

const WorkflowLayout = () => {


    const workflowEditorRef = useRef<WorkflowEditorHandles>(null);
    const [loading,setLoading] = useState(false);
    return (
     
        <div className='flex'
            style={{ height: 'calc(100vh - 16px)' }}
        >
            <WorkflowDetailsCard />
            <div className="relative flex-1 overflow-auto">
                <WorkflowEditor
                    setLoading={setLoading}
                    ref={workflowEditorRef}
                />
            </div>
            <Spin spinning={loading} fullscreen> </Spin>
        </div>
       
    );
}

export default WorkflowLayout;