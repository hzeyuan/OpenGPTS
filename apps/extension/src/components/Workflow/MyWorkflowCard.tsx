import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { Dropdown, type MenuProps } from "antd";
import { Chrome, MoreHorizontalIcon, Play, Trash } from "lucide-react"
import { useRouter } from "next/navigation";
import { Copy } from 'lucide-react';
import { useTimeAgo } from "~src/hooks/useTimeago";
const MyWorkflowCard: React.FC<{
    workflow: PRAWorkflow.WorkflowData,
    deleteWorkflow: (id: string) => void
}> = ({ workflow, deleteWorkflow }) => {
    const router = useRouter();
    const items = [
        {
            key: 'delete',
            label: (
                <div className="flex items-center w-full px-2 py-1 transition rounded-lg cursor-pointer focus:outline-none">
                    <Trash size={20} />
                    <span className="ml-2">Delete</span>
                </div>
            ),
        },
    ]

    const handleCopy = () => {

    }


    const onClick: MenuProps['onClick'] = async ({ key, domEvent }) => {
        if (key === 'delete') {
            deleteWorkflow(workflow.id);
            domEvent.stopPropagation();
        }
    };

    return (
        <div onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(`rpa/workflow/${workflow.id}`)
        }} className="flex flex-col p-4 transition-shadow bg-white border border-gray-700 border-solid rounded-lg shadow-md  hover:bg-[var(--opengpts-workflow-card-hover-bg-color)]  cursor-pointer select-none group   dark:bg-neutral-800">
            <div className="flex items-center mb-2">
                <Chrome />
                {/* {workflow?.icon ? '' :} */}
                <span className="inline-block w-[60%] ml-2 overflow-hidden text-lg font-semibold rounded-lg text-ellipsis bg-box-transparent">{workflow.name}</span>
                <div className="grow"></div>
                <Play className="w-6 h-6"></Play>
                <Dropdown menu={{ items, onClick }}>
                    <MoreHorizontalIcon onClick={(e) => {
                        e.stopPropagation();

                    }} className="w-6 h-6 ml-2 cursor-pointer "></MoreHorizontalIcon>
                </Dropdown>
            </div>

            <div className="flex-1 my-2 cursor-pointer">
                <p className="text-sm leading-tight line-clamp-2">{workflow.description}</p>
            </div>
            <div className="flex flex-col items-end text-sm text-gray-600 dark:text-gray-200">
                <div className="flex items-center gap-x-2 gap-y-1">
                    <p className="flex justify-end">ID: {workflow.id}</p>
                    <Copy onClick={handleCopy} size={16} />
                </div>
                <p className="flex-1">{useTimeAgo(workflow.created_at)}</p>
            </div>
        </div>
    )
}

export default MyWorkflowCard;