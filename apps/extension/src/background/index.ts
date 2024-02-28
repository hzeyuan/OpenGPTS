


import { Storage } from "@plasmohq/storage";
import type { ChatConfig } from "@opengpts/types";
import Browser from "webextension-polyfill";
import { CHATGPT_WEBAPPP_DEFAULT_CONFIG } from "~src/constant";

const storage = new Storage({
    area: "local",
    allCopied: true,

});




storage.getItem<ChatConfig>('config').then((config) => {
    storage.setItem('config', {
        ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
        ...config,
    })
})


chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));



// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     // console.log('接收到消息', request, sender,)
//     if (request.action === "getTabIdFromContentScript") {
//         if (sender.tab) {
//             // sender.tab 包含发送消息的标签页的信息
//             console.log("接收到的标签页 ID:", sender.tab.id);
//             sendResponse({ tabId: sender.tab.id });
//         } else {
//             console.log("消息不是从标签页发送的");
//             sendResponse({ error: "No tab information available" });
//         }
//     }
// });