import type { PlasmoCSConfig } from "plasmo"
import { relayMessage } from "@plasmohq/messaging"


export const config: PlasmoCSConfig = {
    matches: ["http://localhost:1947/*"],
}

console.log('opengpts inject')



// window.addEventListener('message', (event) => {
//     console.log('event', event)
//     const { data } = event
//     if (data.who === 'webOperationAssistant') {
//         console.log('background message', data)
//     }
// })

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message received in content script:", request);
        // 可以根据需要处理消息
    }
);


relayMessage({
    name: "opengpts",
});

relayMessage({
    name: "debugger",
});





