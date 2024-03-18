"use client"
import MyWorkflowCard from "./MyWorkflowCard";
import { useEffect, useState } from "react";
import { getWorkflowsRequest, deleteWorkflowRequest } from "~src/app/services/workflow";
import useSWR, { mutate } from 'swr';
import message from "antd/es/message";
import type PRAWorkflow from "@opengpts/types/rpa/workflow";


const WorkflowCardList: React.FC<any> = () => {

  // const [workflowList, setWorkflowList] = useState(initialWorkflowList);

  const { data: workflowList, error } = useSWR<PRAWorkflow.WorkflowData[]>('getWorkflows', getWorkflowsRequest, { suspense: true });

  const deleteWorkflow = async (id:string) => {
    try {
      // await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      await deleteWorkflowRequest(id);
      mutate('getWorkflows', workflowList?.filter(workflow => workflow.id !== id), false);
      message.success('Workflow deleted');
    } catch (error: any) {
      console.error("Failed to delete workflow:", error);
      message.error('Failed to delete workflow');
    }
  };


  return (
    <div>
      <div className="grid grid-cols-4 gap-4 ">
        {workflowList?.map((workflow) => {
          return <MyWorkflowCard
            deleteWorkflow={deleteWorkflow}
            key={workflow.id}
            workflow={workflow}
          />;
        })}

      </div>
      <button className="relative w-full h-10 mt-2 cursor-pointer hover:bg-neutral-50 btn btn-neutral focus:ring-0 focus:ring-offset-0 md:mt-3">
        <div className="flex items-center justify-center w-full gap-2 text-sm">加载更多</div>
      </button>
    </div>
  );
}
export default WorkflowCardList;