// 假设 '@business/blocks/backgroundHandler' 和 '@/utils/helper' 都是 TypeScript 模块

// import { toCamelCase } from "~src/utils/helper";
import handlerNewTab from './blocksHandler/handlerNewTab'
import handlerTrigger from './blocksHandler/handlerTrigger'
import handlerInteractionBlock from './blocksHandler/handlerInteractionBlock';
import handlerTakeScreenshot from './blocksHandler/handlerTakeScreenshot';
import handlerGoBack from './blocksHandler/handlerGoBack';
import handlerCloseTab from './blocksHandler/handlerClose';
import handlerDelay from './blocksHandler/handlerDelay';
import handlerExportData from './blocksHandler/handlerExportData';
interface Handler {
  [key: string]: any;
}


// 导出一个异步函数，因为我们需要等待模块动态导入
export default function (): { [key: string]: Handler } {

  return {
    'newTab': handlerNewTab,
    trigger: handlerTrigger,
    interactionBlock: handlerInteractionBlock,
    'takeScreenshot': handlerTakeScreenshot,
    'goBack': handlerGoBack,
    'closeTab': handlerCloseTab,
    'delay': handlerDelay,
    'exportData':handlerExportData
  };
}
