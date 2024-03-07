import React, { useState, useContext, useMemo, type ComponentType } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';
import BlockBase from './BlockBase';
import { iconMap } from '~src/utils/workflow';
import useEditorBlock from '~src/hooks/useEditorBlock';

// position, events, dimensions
const BlockBasic: ComponentType<NodeProps & {
    data: any
}> = ({ id, data }) => {
    // const [isCopied, setIsCopied] = useState(false);
    //   const { t } = useContext(WorkflowContext); // 假设你有一个上下文来处理国际化
    //   const workflowUtils = useContext(WorkflowUtilsContext);
    // const loopBlocks = ['loop-data', 'loop-elements'];

    const block = useEditorBlock(data.id);
    const IconComponent = iconMap[data.id]


    const getBlockName = () => {
        const key = `workflow.blocks.${block.details?.id}.name`;
        // 替换为你的国际化逻辑
        return key;
    };


    const iconColor = useMemo(() => {
        return data.disableBlock ? 'bg-box-transparent' : block?.category?.color

    }, [data.disableBlock, block?.category?.color])

    return (
        <BlockBase
            className='block-basic group'
            contentClass=''
            blockId={id}
            blockData={block}
            onEdit={data.onEdit}
            onDelete={data.onDelete}
        // onUpdate={undefined}
        // onSettings={undefined}
        >

            {<Handle id={`${id}-input-1`} type="target" position={Position.Left} />}
            <div className="flex items-center">
                {/* Icon and block name */}
                <span className={`${iconColor} flex  p-2 mr-2 rounded-lg dark:text-black`}>
                    {block?.details?.icon && React.createElement(IconComponent, { size: 16 })}
                </span>
                <div className="flex-1 overflow-hidden">
                    {/* error */}
                    <p
                        //   v-if="block.details.id"
                        className="font-semibold leading-tight text-overflow whitespace-nowrap"
                    >
                        {/*  {{ getBlockName() }} */}
                        {data?.name}
                    </p>
                    {/* <p>描述</p> */}
                </div>

                {/* 其他内容... */}
                <Handle id={`${id}-output-1`} type="source" position={Position.Right} />
                {data.onError?.enable && data.onError?.toDo === 'fallback' && (
                    <Handle id={`${id}-output-fallback`} type="source" position={Position.Right} style={{ top: 'auto', bottom: 10 }} />
                )}
            </div>
        </BlockBase >
    );
};

export default BlockBasic;
