import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging";
import { nanoid } from 'nanoid';
// import type { Action, OperationType } from "@opengpts/types";
import browser from 'webextension-polyfill';
// import showExecutedBlock from './showExecutedBlock';
import handleSelector, { getDocumentCtx, queryElements } from "./handleSelector";
// import { isXPath, toCamelCase } from "~src/utils/helper";
// import { elementSelectorInstance } from "./utils";
// import { cloneDeep } from "lodash-es";
// import blocksHandler from "./blocksHandler";



export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_end",
  world: "MAIN",
}

console.log("window", window,browser.runtime.onMessage.addListener);

console.log(`
______   _______   ________  __    __   ______   _______   ________   ______  
/      \ /       \ /        |/  \  /  | /      \ /       \ /        | /      \ 
/$$$$$$  |$$$$$$$  |$$$$$$$$/ $$  \ $$ |/$$$$$$  |$$$$$$$  |$$$$$$$$/ /$$$$$$  |
$$ |  $$ |$$ |__$$ |$$ |__    $$$  \$$ |$$ | _$$/ $$ |__$$ |   $$ |   $$ \__$$/ 
$$ |  $$ |$$    $$/ $$    |   $$$$  $$ |$$ |/    |$$    $$/    $$ |   $$      \ 
$$ |  $$ |$$$$$$$/  $$$$$/    $$ $$ $$ |$$ |$$$$ |$$$$$$$/     $$ |    $$$$$$  |
$$ \__$$ |$$ |      $$ |_____ $$ |$$$$ |$$ \__$$ |$$ |         $$ |   /  \__$$ |
$$    $$/ $$ |      $$       |$$ | $$$ |$$    $$/ $$ |         $$ |   $$    $$/ 
$$$$$$/  $$/       $$$$$$$$/ $$/   $$/  $$$$$$/  $$/          $$/     $$$$$$/  
                                                                               
`)

// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         const { name } = request;
//         if (name === 'CALL_RPC') {
//             const { funcName, params } = request.body;
//             if (typeof window[funcName] === 'function') {
//                 // @ts-ignore
//                 const result = window[funcName](...params);
//                 sendResponse({ success: true, result });
//             } else {
//                 sendResponse({ success: false, error: 'Function not found' });
//             }

//         }
//         return true;
//     }
// );


// 广播消息，给所有窗口
const broadcastMessage = async (data: Record<string, any>) => {
  console.log('广播消息', data)
  await sendToBackground({
    name: 'opengpts',
    body: {
      type: 'BOARDCAST_MESSAGE_ALL_WINDOW',
      sender: 'webOperationAssistant',
      data: {
        message: {
          ...data,
        }
      }
    },
  })
}



// setInterval(() => {
//     broadcastMessage({
//         name: 'HEART_BEAT',
//         message: 'I am alive'
//     })
// }, 5000)




// window['broadcastMessage'] = broadcastMessage

