
import type { ActionType, SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody } from '@opengpts/types';
import { sendToContentScript, type PlasmoMessaging, sendToBackground } from '@plasmohq/messaging';
import { opengptsStorage } from '~src/store';
import { captureFullPageScreenshot, click, clickAtPosition, setValue, waitForPageLoadUsingDebugger } from '~src/utils/rpa/domActions';
import { getBrowserEnv } from '../browserEnvHelper';


function createWindow(options: chrome.windows.CreateData): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => {
        chrome.windows.create(options, (newWindow) => {
            if (!newWindow) return reject(new Error('create window failed'))
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(newWindow);
            }
        });
    });
}




const handler: PlasmoMessaging.Handler<'opengpts', SendToBackgroundViaRelayRequestBody<ActionType>, SendToBackgroundViaRelayResponseBody> = async (req, res) => {
    const { sender } = req;
    const tabId = req.body?.tabId || sender?.tab?.id;
    const windowId = req.body?.windowId || sender?.tab?.windowId;
    if (!tabId) return res.send({ code: -1, message: "tabId is required" })
    if (!req.body?.type) return res.send({ code: -1, message: "type is required" })
    const { type, message } = req.body
    console.log('sender', sender);
    console.log("req.body", req.body)

    if (type == 'SIGNED_IN' || type === 'INITIAL_SESSION') {
        console.log('SIGNED_IN', message)
        opengptsStorage.setItem("opengpts-user", message)
    }

    if (type == 'SIGNED_OUT') {
        // 清除cookies
        console.log('SIGNED_OUT', message)
        opengptsStorage.removeItem("opengpts-user")
    }

    if (type === 'PASSWORD_RECOVERY') {

    }

    if (type === 'TOKEN_REFRESHED') {

    }

    if (type === 'USER_UPDATED') {

    }

    if (type === 'OPEN_WINDOW') {
        const url = message?.url;
        const autoZoom = message?.autoZoom;
        const windowInfo = await createWindow({
            url:'chrome-extension://migdljjehfllllbkjhfnbfcifaekebjk/tabs/dashboard.html',
            type: "popup", // "normal", "popup", "panel", "detached_panel"
            width: 1024,
            height: 768,
            left: 100,
            top: 100,
        })

        //需要把tabId，传递给contentjs中的全局变量

        const tabId = windowInfo?.tabs?.[0]?.id!

        const cleanup = () => {
            chrome.debugger.detach({ tabId });
        };

        chrome.debugger.attach({ tabId: tabId, }, '1.3', function () {
            chrome.debugger.sendCommand({ tabId }, "Page.enable", {}, () => {
                if (chrome.runtime.lastError) {
                    console.log(`error:${chrome.runtime.lastError}`)
                    cleanup();
                }
                console.log("Debugger detached successfully.");
            });
        });

        console.log('windowInfo', windowInfo)
        if (!windowInfo) return;
        console.log('windowInfo', windowInfo, tabId);
        if (!tabId) return;
        try {
            await waitForPageLoadUsingDebugger(tabId, {
                maxAttempts: 20,
                timeout: 1500,
            });

            if (autoZoom) {
                chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        const scrollWidth = document.documentElement.scrollWidth;
                        const clientWidth = document.documentElement.clientWidth;
                        const zoomFactor = clientWidth / scrollWidth;
                        return { zoomFactor }
                    }
                },
                    (results) => {
                        console.log('zoomFactor', results)
                        const zoomFactor = results[0]?.result?.zoomFactor;
                        if (zoomFactor) {
                            chrome.tabs.setZoom(tabId, zoomFactor, function () {
                                console.log('zoomFactor', zoomFactor)
                                res.send({
                                    code: 0,
                                    message: "窗口已打开",
                                    data: {
                                        windowInfo,
                                        zoomFactor,
                                    }
                                });
                            });
                        }
                    }
                );
            } else {
                res.send({
                    code: 0,
                    message: "ok",
                    data: {
                        windowInfo
                    }
                });
            }
        } catch (error: any) {
            res.send({
                code: -1,
                message: error.message || "oepn window failed",
            })
        }
    } else if (type === 'GET_SCREENSHOT') {
        if (!windowId) {
            res.send({
                code: -1,
                message: "can not get windowId",
            })
            return;
        }

        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, function (screenshot) {
            // console.log('imageSrc', screenshot)
            if (!screenshot) {
                return;
            }
            console.log('chrome.runtime.lastError', chrome.runtime.lastError)
            if (chrome.runtime.lastError) {
                res.send({
                    code: -1,
                    message: chrome.runtime.lastError.message || "获取截图失败",
                })
                return;
            }
            chrome.tabs.create({ url: screenshot });
            res.send({
                code: 0,
                message: "获取截图成功",
                data: {
                    screenshot
                }
            })
        });
    }

    if (type === 'FULL_SCREENSHOT') {
        const dataURI = await captureFullPageScreenshot(tabId);
        chrome.tabs.create({ url: dataURI })
        res.send({
            code: 0,
            message: "ok",
        })
    }

    if (type === 'BROWSER_ENV') {
        const data = await getBrowserEnv(tabId);
        res.send({
            code: 0,
            message: "获取DOM成功",
            data
        })
    }

    if (type == 'SEND_MESSAGE_TO_WINDOW') {
        console.log(`background::>${tabId}:${message}`)
        console.log(`${new Date()}:发送消息给窗口${tabId}执行`)

        const relay = await sendToContentScript({
            name: 'DOM_ACTIONS',
            tabId,
            body: message,
        },)


        console.log(`${new Date()}:发送消息给窗口${tabId}执行完成,结果`, relay)
        res.send({ ...relay })
    }

    if (type === "BOARDCAST_MESSAGE_ALL_WINDOW") {
        // console.log("接受到消息", message)
        chrome.tabs.query({}, function (tabs) {
            for (let tab of tabs) {
                if (!tab.id) return
                chrome.tabs.sendMessage(tab.id, message);
            }
        });
    }

    if (type === 'CHECK_PAGE_LOADED') {
        try {
            await waitForPageLoadUsingDebugger(tabId, {
                maxAttempts: 20,
                timeout: 1500,
            });
            res.send({
                code: 0,
                message: "页面已加载",
            });
        } catch (error) {
            res.send({
                code: -1,
                message: "页面加载超时",
            })
        }

    }
    if (type === 'SET_ZOOM') {
        const zoomFactor = message?.zoomFactor;

        chrome.tabs.setZoom(tabId, zoomFactor, function () {
            if (chrome.runtime.lastError) {
                res.send({
                    code: -1,
                    message: chrome.runtime.lastError.message || "设置缩放失败",
                })
                return;
            }
            res.send({
                code: 0,
                message: "设置缩放成功",
            })
        });
    }

    if (type === 'INJECT_CODE') {
        const code = message?.code;
        if (!code) {
            res.send({
                code: -1,
                message: "code is required",
            })
            return;
        }
        chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", { expression: code, returnByValue: true },
            function (result: any) {
                console.log('result', result)

                if (result && result?.exceptionDetails) {

                    res.send({
                        code: -1,
                        message: chrome.runtime.lastError?.message || "error",
                    })
                    return
                }
                res.send({
                    code: 0,
                    message: "ok",
                    data: result?.value
                })
            }
        );
    }
}



export default handler

// window.postMessage({
//     "actions":[{
//         "name":"type",
//         "element":"#APjFqb",
//         "value":"test"
//     }]
// },"*")


