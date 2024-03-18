import React, { createContext, useContext, useMemo, useState } from 'react';
import { Play, Pencil, Settings, Delete } from 'lucide-react';
import type PRAWorkflow from '@opengpts/types/rpa/workflow';
import { useWorkflowEditorContext } from '~src/app/context/WorkflowEditorContext';
import Tag from 'antd/es/tag';
import { useNodes } from 'reactflow';
import ExpandPanel from '../ExpandPanel';


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
  const {executeFromBlock } = useWorkflowEditorContext();

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
    if (!executeFromBlock) return;
    executeFromBlock(blockId);
  };

  return (
    <div>
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


        {/* <div>
        {JSON.stringify(node?.data.data)}
      </div> */}
      </div>


      <div className='flex flex-col gap-1 mt-1 max-w-70 '>

        <ExpandPanel
          headerClass='flex items-center  focus:ring-0 w-full text-left text-gray-600 dark:text-gray-200'
          header={
            <>
              <Tag className="flex flex-col gap-x-1" size="small" bordered={false} color="processing">
                input:
              </Tag>
            </>
          }
        >
          <div className="text-xs bg-white border shadow-sm ">
            {blockData?.details?.refDataKeys?.map(key => {
              return (<div className="flex flex-col gap-1">
                <div className="p-1 bg-gray-100 ">{key}:</div>
                <div className="px-1">  {(blockData?.details.data[key]).toString() || 'No Value'}</div>
              </div>)
            })
            }
          </div>
        </ExpandPanel>

        <ExpandPanel
          headerClass='flex items-center  focus:ring-0 w-full text-left text-gray-600 dark:text-gray-200'
          header={
            <>
              <Tag className="flex flex-col gap-x-1" size="small" bordered={false} color="green">
                output:
              </Tag>
            </>
          }
        >
          <div className="px-2 py-1 text-xs bg-white border shadow-sm">
            {/* {JSON.stringify(blockData)} */}
            {JSON.stringify(node?.output)}
            {node?.data?.output ? Object.keys(node?.data?.output)?.map(key => {
              return (<div className="flex flex-col gap-1">
                <div className="p-1 bg-gray-100 ">{key}:</div>
                <div className="px-1">  {(node?.data?.output[key]).toString()}</div>
              </div>)
            })
              :
              <div>
                No Output
              </div>}
          </div>
        </ExpandPanel>
      </div>
    </div>

  );
};

export default BlockBase;
``
