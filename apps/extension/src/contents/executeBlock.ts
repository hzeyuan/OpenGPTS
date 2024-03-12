import type { PlasmoCSConfig } from "plasmo"
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill';
import showExecutedBlock from './showExecutedBlock';
import handleSelector, { getDocumentCtx, queryElements } from "./handleSelector";
import { isXPath, toCamelCase } from "~src/utils/helper";
import { elementSelectorInstance } from "./utils";
import { cloneDeep } from "lodash-es";
import blocksHandler from "./blocksHandler";

// export const config: PlasmoCSConfig = {
//   matches: ["<all_urls>"],
//   world:"MAIN",
//   // all_frames: false,
//   // run_at: "document_end",
//   // world: "ISOLATED"

// }


// console.log('execute block', chrome.runtime, document)




browser.runtime.onMessage.addListener(async (data) => {
  console.log('addMessageListener', data.isBlock, JSON.stringify(data));

  const asyncExecuteBlock = async (block) => {
    try {
      const res = await executeBlock(block);
      return res;
    } catch (error) {
      console.error(error);
      const elNotFound = error.message === 'element-not-found';
      const isLoopItem = data.data?.selector?.includes('automa-loop');

      if (!elNotFound || !isLoopItem) return Promise.reject(error);

      const findLoopEl = data.loopEls.find(({ url }) =>
        window.location.href.includes(url)
      );

      const blockData = { ...data.data, ...findLoopEl, multiple: true };
      const loopBlock = {
        ...data,
        onlyGenerate: true,
        data: blockData,
      };

      // await blocksHandler().loopData(loopBlock);
      return executeBlock(block);
    }
  };

  if (data.isBlock) {
    const res = await asyncExecuteBlock(data);
    return res;
  }

  // switch (data.type) {
  //   case 'input-workflow-params':
  //     window.initPaletteParams?.(data.data);
  //     return Boolean(window.initPaletteParams);
  //   case 'content-script-exists':
  //     return true;
  //   case 'automa-element-selector': {
  //     return elementSelectorInstance();
  //   }
  //   case 'context-element': {
  //     let $ctxElSelector = '';

  //     if (contextElement) {
  //       $ctxElSelector = findSelector(contextElement);
  //       contextElement = null;
  //     }
  //     if (!$ctxTextSelection) {
  //       $ctxTextSelection = window.getSelection().toString();
  //     }

  //     const cloneContextData = cloneDeep({
  //       $ctxLink,
  //       $ctxMediaUrl,
  //       $ctxElSelector,
  //       $ctxTextSelection,
  //     });

  //     $ctxLink = '';
  //     $ctxMediaUrl = '';
  //     $ctxElSelector = '';
  //     $ctxTextSelection = '';

  //     return cloneContextData;
  //   }
  //   default:
  //     return null;
  // }


});




export default async function executeBlock(data) {
  console.log(`executeBlock`, data)
  const handlers = blocksHandler();

  console.log('content.js handlers', handlers)
  const handler = handlers[toCamelCase(data.name || data.label)];
  console.log('content.js handler', toCamelCase(data.name || data.label), handler)
  // if (handler) {

  //   console.log(`准备执行时间`, new Date())
  //   if (toCamelCase(data.name || data.label) === 'forms') {
  //     await new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve('等待5秒');
  //       }, 3000);
  //     });
  //   } else {

  //     const result = await handler(data, { handleSelector });

  //     console.log('result', result);
  //     // removeExecutedBlock();

  //     return result;
  //   }
  //   console.log(`最终执行结束时间;`, new Date());
  //   return

  // }

  if (handler) {

    console.log(`准备执行时间`, new Date())
    const result = await handler(data, { handleSelector });
    console.log('result', result);
    // removeExecutedBlock();
    console.log(`最终执行结束时间;`, new Date());
    return result;


  }

  const error = new Error(`"${data.label}" doesn't have a handler`);
  console.error(error);

  throw error;
}

