


import { Storage } from "@plasmohq/storage";
import type { ChatConfig } from "@opengpts/types";
import { MessageListener } from '~src/utils/message';
import browser from 'webextension-polyfill';
import { CHATGPT_WEBAPPP_DEFAULT_CONFIG } from "~src/constant";
import BackgroundWorkflowUtils from "./BackgroundWorkflowUtils";
import { sleep } from "~src/utils/helper";
import BackgroundEventsListeners from "./BackgroundEventsListeners";


const storage = new Storage({
    area: "local",
    allCopied: true,

});

// browser.runtime.onStartup.addListener(
//     BackgroundEventsListeners.onRuntimeStartup
// );

// browser.runtime.onInstalled.addListener(
//     BackgroundEventsListeners.onRuntimeInstalled
// );

const message = new MessageListener('background');
message.on('workflow:stop', (stateId) => workflowState.stop(stateId));
message.on('workflow:execute', async (workflowData, sender) => {

    console.log('background', 'workflow:execute', workflowData, sender);
    const context = 'background'

    // const isMV2 = browser.runtime.getManifest().manifest_version === 2;
    const isMV2 = false;
    console.log(
        'workflow:execute',
        workflowData,
        !isMV2 && (!context)
    );

    if (workflowData.includeTabId) {
        if (!workflowData.options) workflowData.options = {};

        workflowData.options.tabId = sender.tab.id;
    }

    BackgroundWorkflowUtils.executeWorkflow(
        workflowData,
        workflowData?.options || {}
    );
});


message.on('debugger:send-command', ({ tabId, method, params }) => {
    return new Promise((resolve) => {
        console.log('background:debugger:send-command', tabId, method, params, new Date() )
        chrome.debugger.sendCommand({ tabId }, method, params, resolve);
    });
});


message.on('debugger:type', ({ tabId, commands, delay }) => {
    return new Promise((resolve) => {
        console.log(`3. background:debugger:type`, tabId, commands, delay, new Date())
        let index = 0;
        async function executeCommands() {
            const command = commands[index];
            console.log(`background:debugger:type:executeCommands`, command, new Date())
            if (!command) {
                console.log('background:debugger:type:resolve', tabId, new Date());
                resolve();
                return;
            }

            chrome.debugger.sendCommand(
                { tabId },
                'Input.dispatchKeyEvent',
                command,
                async () => {
                    if (delay > 0) await sleep(delay);
                    console.log('command', command)
                    index += 1;
                    executeCommands();
                }
            );
        }
        executeCommands();
    });
});


browser.runtime.onMessage.addListener(message.listener());


// chrome.webRequest.onBeforeSendHeaders.addListener(
//     function (details) {
//         let headers = details.requestHeaders;
//         // console.log('headers', headers)
//         if (!headers) return
//         let authHeader = headers.find(header => header.name.toLowerCase() === 'authorization');
//         const token = authHeader?.value?.replace('Bearer ', '').trim()
//         if (authHeader) {
//             storage.getItem<ChatConfig>('chatgpt-config').then(preConfig => {
//                 storage.setItem('chatgpt-config', {
//                     ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
//                     ...preConfig,
//                     token
//                 })
//             })
//             chrome.tabs.query({}, function (tabs) {
//                 tabs.forEach(tab => {
//                     if (!tab.id) return
//                     chrome.tabs.sendMessage(tab.id, {
//                         action: "syncLocalStorage",
//                         key: "chatgpt-token",
//                         value: token
//                     });
//                 });
//             });
//         }
//         return { requestHeaders: headers };
//     },
//     { urls: ["https://chat.openai.com/*"] },
//     ["requestHeaders"]
// );



// // Browser.webRequest.onBeforeRequest.addListener(
// //     async (details) => {
// //         if (
// //             details.url.includes('/public_key') &&
// //             !details.url.includes('cgb=vhwi')
// //         ) {
// //             let bodyData;
// //             if (details.requestBody.formData) {
// //                 // 如果是formData类型
// //                 let formData = new URLSearchParams();
// //                 for (const key in details.requestBody.formData) {
// //                     formData.append(key, details.requestBody.formData[key]);
// //                 }
// //                 bodyData = formData.toString();
// //             } else if (details.requestBody.raw) {
// //                 // 如果是raw类型，需要根据实际的Content-Type进行解析
// //                 // 这里是一个简单的例子，实际应用中可能需要更复杂的处理
// //                 let encodedData = details.requestBody.raw[0].bytes;
// //                 bodyData = new TextDecoder().decode(encodedData);
// //                 // 进一步处理，例如转换为JSON或其他格式
// //             }
// //             const config = await storage.getItem<any>('chatgpt-config') || {}
// //             console.debug('chatgptArkoseReqUrl', config, 'bodyData', bodyData)
// //             console.log('config', config)
// //             await storage.setItem('chatgpt-config', {
// //                 ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
// //                 ...config,
// //                 chatgptArkoseReqUrl: details.url,
// //                 chatgptArkoseReqForm: bodyData,
// //             })
// //             console.log('Arkose req url and form saved')
// //         }
// //     },
// //     {
// //         urls: ['https://*.openai.com/*'],
// //         types: ['xmlhttprequest'],
// //     },
// //     ['requestBody'],
// // )


// storage.getItem<ChatConfig>('config').then((config) => {
//     storage.setItem('config', {
//         ...CHATGPT_WEBAPPP_DEFAULT_CONFIG,
//         ...config,
//     })
// })


// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));


