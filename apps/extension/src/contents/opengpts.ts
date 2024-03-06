import type { PlasmoCSConfig } from "plasmo"
import { relayMessage } from "@plasmohq/messaging"
import executeBlock from './executeBlock';
import blocksHandler from "./blocksHandler";

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:1947/*", '<all_urls>'],
}

console.log('opengpts inject', chrome.runtime)



// window.addEventListener('message', (event) => {
//     console.log('event', event)
//     const { data } = event
//     if (data.who === 'webOperationAssistant') {
//         console.log('background message', data)
//     }
// })

// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         console.log("Message received in content script:", request);
//         // 可以根据需要处理消息
//         return true;
//     }
// );



relayMessage({
  name: "opengpts",
});

relayMessage({
  name: "debugger",
});


relayMessage({
  name: "workflow",
});





