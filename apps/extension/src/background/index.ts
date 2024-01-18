


import { Storage } from "@plasmohq/storage";


const storage = new Storage({
    area: "local",
    allCopied: true,
  });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('接收到消息', request, sender,)
    if (request.action === "getTabIdFromContentScript") {
        if (sender.tab) {
            // sender.tab 包含发送消息的标签页的信息
            console.log("接收到的标签页 ID:", sender.tab.id);
            sendResponse({ tabId: sender.tab.id });
        } else {
            console.log("消息不是从标签页发送的");
            sendResponse({ error: "No tab information available" });
        }
    }
});



chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        let headers = details.requestHeaders;
        // console.log('headers', headers)
        let authHeader = headers.find(header => header.name.toLowerCase() === 'authorization');
        if (authHeader) {
            // console.log('Authorization:', authHeader.value);
            // 可以在这里根据需要处理或发送Authorization信息
            storage.setItem('Authorization', authHeader.value)
        }   
        return { requestHeaders: headers };
    },
    { urls: ["https://chat.openai.com/*"] },
    ["requestHeaders"]
);