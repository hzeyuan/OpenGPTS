import React, { useMemo, useState } from 'react';
import { Play, Pencil, Settings, ToggleLeft, ToggleRight, Delete, CheckCircle, AlertTriangle } from 'lucide-react';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { useWorkflowEditorContext } from '~src/app/context/WorkflowEditorContext';
import Tag from 'antd/es/tag';
import Badge from 'antd/es/badge';
import { useNodes } from 'reactflow';


const BlockBase: React.FC<{
  className?: string,
  contentClass?: string,
  blockData?: {
    details?: PRAWorkflow.Block | undefined;
    category?: PRAWorkflow.Category | undefined;
  },
  data?: any,
  blockId: string,
  onEdit?: (id: string) => undefined,
  onDelete?: (id: string) => undefined,
  onUpdate?: (props: {
    disableBlock: boolean
  }) => undefined,
  onSettings?: (props: {
    details: any,
    data: any,
    blockId: string
  }) => undefined,
  children: React.ReactNode
}> = ({ className = '', contentClass = '', blockData = {}, data = {}, blockId = '', onEdit, onDelete, onUpdate, onSettings, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  // const WorkflowContext = createContext();
  // const WorkflowUtilsContext = createContext();
  // const workflowUtils = useContext(WorkflowUtilsContext);
  const workflowUtils = useWorkflowEditorContext();


  const nodes = useNodes();
  const insertToClipboard = () => {
    navigator.clipboard.writeText(blockId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const node = useMemo(() => {
    return nodes.find(n => n.id === blockId);
  }, [nodes])

  // const handleStartDrag = (event) => {
  //   const payload = {
  //     data,
  //     fromBlockBasic: true,
  //     blockId,
  //     id: blockData.details?.id,
  //   };
  //   event.dataTransfer.setData('block', JSON.stringify(payload));
  // };

  const handleRunWorkflow = (e) => {
    e.stopPropagation();
    if (!workflowUtils) return;
    workflowUtils.executeFromBlock(blockId);
  };

  return (
    <div className={`block-base relative w-40 rounded-lg ${className}`} data-block-id={blockId} onDoubleClick={() => onEdit?.(blockId)}>
      <div className="absolute top-0 hidden w-full block-menu-container" style={{ transform: 'translateY(-100%)' }}>
        <p title="Block id (click to copy)" className="inline-block px-1 pointer-events-auto block-menu text-overflow dark:text-gray-300"
          style={{ maxWidth: '96px', marginBottom: 0 }} onClick={insertToClipboard}>
          {isCopied ? '✅ Copied' : blockId}
        </p>

        <div className="inline-flex items-center justify-center block-menu dark:text-gray-300">
          {!blockData.details?.disableDelete && (
            <button className='h-6 p-2 ' title="Delete block" onClick={(e) => {
              e.stopPropagation();
              onDelete?.(blockId);
            }}>
              <Delete className='cursor-pointer' size="16" />
            </button>
          )}
          <button className='h-6 p-2 ' title="Settings" onClick={() => onSettings?.({ details: blockData.details, data, blockId })}>
            <Settings className='cursor-pointer' size="16" />
          </button>
          {/* {blockData.details?.id !== 'trigger' && (
            <button className='cursor-pointer' title="Enable/Disable block" onClick={() => onUpdate?.({ disableBlock: !data.disableBlock })}>
              {data.disableBlock ? <ToggleLeft size="20" /> : <ToggleRight size="20" />}
            </button>
          )} */}
          <button onClick={handleRunWorkflow} className='h-6 p-2' title="Run workflow from here" >
            <Play className='cursor-pointer' size="16" />
          </button>
          {!blockData.details?.disableEdit &&
            <button className='h-6 p-2 cursor-pointer' title="Edit block" onClick={() => onEdit?.(blockId)}><Pencil size="16" /></button>}
        </div>
      </div>
      {/* ui-card */}
      <button className={`block-base__content w-full relative z-10  ui-card rounded-lg bg-white dark:bg-gray-800 p-3  ${contentClass}`}>
        {/* {workflow?.data?.value.testingMode && (
          <CircleDashed
            className={`absolute left-0 top-0 ${data.$breakpoint ? 'text-red-500 dark:text-red-400' : ''}`}
            title="Set as breakpoint"
            size="20"
            onClick={() => onUpdate({ $breakpoint: !data.$breakpoint })}
          />
        )} */}
        {children}
      </button>
      <div className='flex flex-col gap-1 mt-1 '>
        {blockData?.details?.refDataKeys?.map(key => {
          return (<button className="flex">
            {
              node?.data?.data[key] ?
                <Tag className="flex items-center gap-x-1" size="small" bordered={false} color="green">{key}
                  <CheckCircle color='green' className='w-[14px] h-[14px]' />
                </Tag>
                :
                <Tag className="flex items-center gap-x-1" size="small" bordered={false} color="red">{key}
                  <AlertTriangle color="red" className='w-[14px] h-[14px]' />
                </Tag>

            }

          </button>)
        })
        }
      </div>
      <div>
        {JSON.stringify(node?.data.data)}
      </div>
    </div>
  );
};

export default BlockBase;
``
