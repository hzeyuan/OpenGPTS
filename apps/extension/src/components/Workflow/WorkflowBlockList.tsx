import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { AlertCircle, PinIcon } from 'lucide-react';
import { iconMap } from '~src/utils/workflow';


const Block: React.FC<{
    name: string;
    id?: string;
}> = ({ name, id }) => {

    if (!id) return <></>;

    const IconComponent = iconMap[id];

    return (
        <div
            draggable="true"
            className="relative p-4 transition rounded-lg cursor-move select-none bg-input group"
            onDragStart={(event) => {
                event.dataTransfer.setData('block', JSON.stringify({ name, id }));
            }}
        >
            <div
                className="absolute flex items-center invisible text-gray-600 block-tools right-2 top-2 group-hover:visible dark:text-gray-300"
            >
                <span className="flex ml-1 cursor-pointer gap-x-1 ">
                    <AlertCircle  className='w-4 h-4 hover:text-[var(--opengpts-primary-color)]' />
                    <PinIcon className='w-4 h-4 hover:text-[var(--opengpts-primary-color)]'></PinIcon>
                </span>
            </div>
            {IconComponent && <IconComponent className="w-6 h-6 mb-2" />}
            <p className="text-lg leading-tight capitalize text-overflow ">{name}</p>
        </div>
    )
}

const WorkflowBlockList: React.FC<{
    blocks: PRAWorkflow.Block[]
}> = ({ blocks }) => {
    return (
        <div className="grid grid-cols-2 gap-2 mb-4">
            {
                blocks?.map((block, key) => {
                    return <Block key={key} id={block?.id} name={block.name}></Block>
                })
            }
        </div>
    )
}

export default WorkflowBlockList;
