


import { Storage } from "@plasmohq/storage";
import Browser from "webextension-polyfill";
import { defaultConfig } from "~src/constant";

const storage = new Storage({
    area: "local",
    allCopied: true,
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log('接收到消息', request, sender,)
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
            const config = await storage.getItem<any>('config')
            console.log('chatgptArkoseReqUrl', config, 'bodyData', bodyData)
            console.log('details', details)
            await storage.setItem('config', {
                ...defaultConfig,
                // ...config,
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