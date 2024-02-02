


import { Storage } from "@plasmohq/storage";
import type { ChatConfig } from "@opengpts/types";
import Browser from "webextension-polyfill";
import { CHATGPT_WEBAPPP_DEFAULT_CONFIG } from "@opengpts/core/constant";

const storage = new Storage({
    area: "local",
    allCopied: true,

});



chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        let headers = details.requestHeaders;
        // console.log('headers', headers)
        if (!headers) return
        let authHeader = headers.find(header => header.name.toLowerCase() === 'authorization');
        const token = authHeader?.value?.replace('Bearer ', '').trim()
        if (authHeader) {
            storage.getItem<ChatConfig>('chatgpt-config').then(preConfig => {
                storage.setItem('chatgpt-config', {
                    ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
                    ...preConfig,
                    token
                })
            })
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(tab => {
                    if (!tab.id) return
                    chrome.tabs.sendMessage(tab.id, {
                        action: "syncLocalStorage",
                        key: "chatgpt-token",
                        value: token
                    });
                });
            });
        }
        return { requestHeaders: headers };
    },
    { urls: ["https://chat.openai.com/*"] },
    ["requestHeaders"]
);



Browser.webRequest.onBeforeRequest.addListener(
    async (details) => {
        if (
            details.url.includes('/public_key') &&
            !details.url.includes('cgb=vhwi')
        ) {
            let bodyData;
            if (details.requestBody.formData) {
                // 如果是formData类型
                let formData = new URLSearchParams();
                for (const key in details.requestBody.formData) {
                    formData.append(key, details.requestBody.formData[key]);
                }
                bodyData = formData.toString();
            } else if (details.requestBody.raw) {
                // 如果是raw类型，需要根据实际的Content-Type进行解析
                // 这里是一个简单的例子，实际应用中可能需要更复杂的处理
                let encodedData = details.requestBody.raw[0].bytes;
                bodyData = new TextDecoder().decode(encodedData);
                // 进一步处理，例如转换为JSON或其他格式
            }
            const config = await storage.getItem<any>('chatgpt-config') || {}
            console.debug('chatgptArkoseReqUrl', config, 'bodyData', bodyData)
            console.log('config', config)
            await storage.setItem('chatgpt-config', {
                ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
                ...config,
                chatgptArkoseReqUrl: details.url,
                chatgptArkoseReqForm: bodyData,
            })
            console.log('Arkose req url and form saved')
        }
    },
    {
        urls: ['https://*.openai.com/*'],
        types: ['xmlhttprequest'],
    },
    ['requestBody'],
)


storage.getItem<ChatConfig>('config').then((config) => {
    storage.setItem('config', {
        ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
        ...config,
    })
})


chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));


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