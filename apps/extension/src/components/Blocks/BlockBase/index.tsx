import React, { useState } from 'react';
import { Play, Pencil, Settings, ToggleLeft, ToggleRight, Delete, CircleDashed } from 'lucide-react';


const BlockBase: React.FC<{
  className?: string,
  contentClass?: string,
  blockData?: any,
  data?: any,
  blockId: string,
  onEdit?: () => undefined,
  onDelete?: () => undefined,
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



  const insertToClipboard = () => {
    navigator.clipboard.writeText(blockId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  // const handleStartDrag = (event) => {
  //   const payload = {
  //     data,
  //     fromBlockBasic: true,
  //     blockId,
  //     id: blockData.details?.id,
  //   };
  //   event.dataTransfer.setData('block', JSON.stringify(payload));
  // };

  // const runWorkflow = () => {
  //   if (!workflowUtils) return;
  //   workflowUtils.executeFromBlock(blockId);
  // };

  return (
    <div className={`block-base relative w-40 rounded-lg ${className}`} data-block-id={blockId} onDoubleClick={onEdit}>
      <div className="absolute top-0 hidden w-full block-menu-container" style={{ transform: 'translateY(-100%)' }}>
        <p title="Block id (click to copy)" className="inline-block px-1 pointer-events-auto block-menu text-overflow dark:text-gray-300"
          style={{ maxWidth: '96px', marginBottom: 0 }} onClick={insertToClipboard}>
          {isCopied ? '✅ Copied' : blockId}
        </p>

        <div className="inline-flex items-center block-menu dark:text-gray-300">
          {!blockData.details?.disableDelete && (
            <button title="Delete block" onClick={onDelete}>
              <Delete size="20" />
            </button>
          )}
          <button title="Settings" onClick={() => onSettings?.({ details: blockData.details, data, blockId })}>
            <Settings size="20" />
          </button>
          {blockData.details?.id !== 'trigger' && (
            <button title="Enable/Disable block" onClick={() => onUpdate?.({ disableBlock: !data.disableBlock })}>
              {data.disableBlock ? <ToggleLeft size="20" /> : <ToggleRight size="20" />}
            </button>
          )}
          {/* onClick={runWorkflow} */}
          <button title="Run workflow from here" >
            <Play size="20" />
          </button>
          {!blockData.details?.disableEdit && <button title="Edit block" onClick={onEdit}><Pencil size="20" /></button>}
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
    </div>
  );
};

export default BlockBase;
``
