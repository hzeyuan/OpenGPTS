import { sleep } from ".";


function scrollIntoViewFunction() {
    // @ts-expect-error this is run in the browser context
    this.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
    });
}
export const scrollScriptString = scrollIntoViewFunction.toString();



const delayBetweenClicks = 1000;
const delayBetweenKeystrokes = 100;

async function sendCommand(tabId: number, method: string, params?: any) {
    return chrome.debugger.sendCommand({ tabId }, method, params);
}



/**
 * Retrieves the object ID of an element identified by a unique selector in a specific tab.
 * @param tabId The ID of the tab where the element resides.
 * @param uniqueSelector The unique selector used to identify the element.
 * @returns The object ID of the element.
 * @throws Error if the element or object ID cannot be found.
 */
async function getObjectId(tabId: number, uniqueSelector: string) {
    const document = (await sendCommand(tabId, 'DOM.getDocument')) as any;
    const { nodeId } = (await sendCommand(tabId, 'DOM.querySelector', {
        nodeId: document.root.nodeId,
        selector: uniqueSelector,
    })) as any;
    if (!nodeId) {
        throw new Error('Could not find node');
    }
    // get object id
    const result = (await sendCommand(tabId, 'DOM.resolveNode', { nodeId })) as any;
    const objectId = result.object.objectId;
    if (!objectId) {
        throw new Error('Could not find object');
    }
    console.log('objectId:', objectId); // Debug log
    return objectId;
}




async function scroll(tabId: number, payload: {
    uniqueSelector?: string
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
}) {

    let deltaX = 0;
    let deltaY = 0;
    const scrollDistance = 100; // 假设的滚动距离，您可以根据需要调整

    console.log('direction', payload?.direction)
    console.log('uniqueSelector', payload?.uniqueSelector)

    // 设置滚动方向和距离
    switch (payload.direction) {
        case 'UP':
            deltaY = scrollDistance;
            break;
        case 'DOWN':
            deltaY = -scrollDistance;
            break;
        case 'LEFT':
            deltaX = scrollDistance;
            break;
        case 'RIGHT':
            deltaX = -scrollDistance;
            break;
    }


    if (!!payload?.uniqueSelector) {
        const objectId = await getObjectId(tabId, payload.uniqueSelector)
        const { x, y, width, height } = await getCenterCoordinates(tabId, objectId);

        switch (payload.direction) {
            case 'UP':
            case 'DOWN':
                deltaY = (payload.direction === 'UP' ? -1 : 1) * height;
                break;
            case 'LEFT':
            case 'RIGHT':
                deltaX = (payload.direction === 'LEFT' ? -1 : 1) * width;
                break;
        }

        console.log('x', x, 'y', y, 'deltaX', deltaX, 'deltaY', deltaY)
        await sendCommand(tabId, 'Input.dispatchMouseEvent', {
            type: "mouseMoved", x, y, deltaX: 0, deltaY: 0
        });
        await sendCommand(tabId, 'Input.dispatchMouseEvent', {
            type: "mouseWheel", x, y, deltaX, deltaY
        })
    } else {
        let scrollScript = '';
        const scrollAmount = 'window.innerHeight'; // 用于垂直滚动的距离
        const scrollAmountHorizontal = 'window.innerWidth'; // 用于水平滚动的距离

        switch (payload.direction) {
            case 'UP':
                scrollScript = `window.scrollBy(0, -${scrollAmount});`;
                break;
            case 'DOWN':
                scrollScript = `window.scrollBy(0, ${scrollAmount});`;
                break;
            case 'LEFT':
                scrollScript = `window.scrollBy(-${scrollAmountHorizontal}, 0);`;
                break;
            case 'RIGHT':
                scrollScript = `window.scrollBy(${scrollAmountHorizontal}, 0);`;
                break;
        }
        await sendCommand(tabId, 'Runtime.evaluate', { expression: scrollScript });
    }
    await sleep(500);

}

async function getCenterCoordinates(tabId: number, objectId: string) {
    const { model } = (await sendCommand(tabId, 'DOM.getBoxModel', { objectId })) as any;
    const [x1, y1, x2, y2, x3, y3, x4, y4] = model.border;
    const centerX = (x1 + x3) / 2;
    const centerY = (y1 + y3) / 2;
    const width = x3 - x1;
    const height = y3 - y1;
    return { x: centerX, y: centerY, width, height };
}



async function scrollIntoView(tabId: number, objectId: string) {
    await sendCommand(tabId, 'Runtime.callFunctionOn', {
        objectId,
        functionDeclaration: scrollScriptString,
    });
    await sleep(1000);
}

async function clickAtPosition(
    tabId: number,
    x: number,
    y: number,
    clickCount = 1
): Promise<void> {
    // callRPC('ripple', [x, y]);
    await sendCommand(tabId, 'Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x,
        y,
        button: 'left',
        clickCount,
    });
    await sendCommand(tabId, 'Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x,
        y,
        button: 'left',
        clickCount,
    });
    await sleep(delayBetweenClicks);
}



async function click(tabId: number, payload: { uniqueSelector: string }) {

    const objectId = await getObjectId(tabId, payload.uniqueSelector);
    console.log('objectId:', objectId); // Debug log
    await scrollIntoView(tabId, objectId);
    const { x, y } = await getCenterCoordinates(tabId, objectId);
    console.log('x:', x, 'y:', y); // Debug log
    await clickAtPosition(tabId, x, y);
}

async function selectAllText(tabId: number, x: number, y: number) {
    await clickAtPosition(tabId, x, y, 3);
}



/**
 * Blurs the currently focused element in the specified tab.
 * @param tabId The ID of the tab.
 */
async function blurFocusedElement(tabId: number) {
    const blurFocusedElementScript = `
        if (document.activeElement) {
          document.activeElement.blur();
        }
      `;
    await sendCommand(tabId, 'Runtime.evaluate', {
        expression: blurFocusedElementScript,
    });
}



/**
 * Types text into a specified tab.
 * 
 * @param tabId The ID of the tab to type into.
 * @param text The text to type.
 * @returns A promise that resolves once the text has been typed.
 */
async function typeText(tabId: number, text: string): Promise<void> {
    for (const char of text.toString()) {
        await sendCommand(tabId, 'Input.dispatchKeyEvent', {
            type: 'keyDown',
            text: char,
        });
        await sleep(delayBetweenKeystrokes / 2);
        await sendCommand(tabId, 'Input.dispatchKeyEvent', {
            type: 'keyUp',
            text: char,
        });
        await sleep(delayBetweenKeystrokes / 2);
    }
    console.log(`%c [DEBUGGER]`, `color: #ff00ff`, `Typing text: ${text}`)
}

/**
 * Sets the value of an element identified by a unique selector.
 * 
 * @param tabId The ID of the tab where the element is located.
 * @param payload An object containing the unique selector and the value to set.
 * @returns A promise that resolves when the value is set.
 */
async function setValue(tabId: number, payload: {
    uniqueSelector: string;
    value: string;
}): Promise<void> {
    console.log('[setValue] tabId', tabId)
    const objectId = await getObjectId(tabId, payload.uniqueSelector);
    await scrollIntoView(tabId, objectId);
    console.log('scrollIntoView')
    const { x, y } = await getCenterCoordinates(tabId, objectId);
    console.log('x', x, 'y', y, new Date())
    await selectAllText(tabId, x, y);
    await typeText(tabId, payload.value);

    // await blurFocusedElement(tabId);

    // 自动回车
    await sendCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'keyDown',
        key: 'Enter',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
    });

    // 释放 Enter 键
    await sendCommand(tabId, 'Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: 'Enter',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13,
    });
    console.log(`[DEBUGGER] press Enter`)
}


async function captureFullPageScreenshot(tabId: number) {
    // 可选：使用Page.getLayoutMetrics获取页面尺寸来设置clip参数
    const layoutMetrics = await sendCommand(tabId, 'Page.getLayoutMetrics') as any;
    console.log('layoutMetrics', layoutMetrics)
    const clip = {
        x: 0,
        y: 0,
        width: layoutMetrics.contentSize.width,
        height: layoutMetrics.contentSize.height,
        scale: 1 // 使用1的缩放比例以保持原始尺寸
    };

    // 使用clip参数捕获整个页面
    const screenshotData = await sendCommand(tabId, 'Page.captureScreenshot', {
        format: 'png', // 或者 'jpeg'
        clip: clip,
        captureBeyondViewport: true,
    })  as any

    return 'data:image/png;base64,' + screenshotData.data
}


/**
 * Captures a screenshot of a fixed area on the page.
 * @param tabId The ID of the tab where the screenshot will be captured.
 * @returns The base64-encoded image data of the captured screenshot.
 */
async function captureFixedAreaScreenshot(tabId: number) {
    // 直接指定clip参数来捕获固定区域
    const clip = {
        x: 100, // 起始X坐标
        y: 100, // 起始Y坐标
        width: 400, // 区域宽度
        height: 300, // 区域高度
        scale: 1
    };

    // 使用clip参数捕获指定区域
    const screenshotData:any = await sendCommand(tabId, 'Page.captureScreenshot', {
        format: 'png', // 或者 'jpeg'
        clip: clip
    });

    return 'data:image/png;base64,' + screenshotData?.data
}


async function waitForPageLoadUsingDebugger(tabId: number, options: {
    timeout?: number,
    maxAttempts?: number
}) {
    return new Promise(async (resolve, reject) => {
        const { timeout, maxAttempts } = options;
        let attempts = 0;
        const interval = timeout || 1500;
        const maxAttemptsResolved = maxAttempts || 20;
        let intervalId: any = null;

        // 检查页面是否已经加载
        async function checkPageLoad() {
            try {
                const { currentIndex, entries } = await sendCommand(tabId, 'Page.getNavigationHistory') as any;
                console.log('currentIndex',currentIndex,entries)
                if (entries[currentIndex].title !== "") { // 假设标题非空表示页面已加载
                    console.log("Page already loaded.");
                    resolve(true);
                    return true;
                }
            } catch (error) {
                console.error("Error checking page load status:", error);
                reject(error);
                return false;
            }
            return false;
        }

        // 如果页面已经加载，不需要继续
        if (await checkPageLoad()) return;

        // 注册debugger事件监听器
        const listener = (source: chrome.debugger.Debuggee, method: string, params?: Object | undefined) => {
            if (source.tabId === tabId && method === "Page.loadEventFired") {
                console.log("Page is fully loaded.");
                cleanup();
                resolve(true);
            }
        };
        chrome.debugger.onEvent.addListener(listener);

        // 如果页面加载超时，则重试或拒绝
        const retryOrReject = () => {
            if (attempts < maxAttemptsResolved) {
                attempts++;
            } else {
                cleanup();
                reject(new Error('页面加载超时'));
            }
        };

        // 设置超时检查
        intervalId = setInterval(retryOrReject, interval);

        // 清理函数，移除事件监听器和定时器
        const cleanup = () => {
            clearInterval(intervalId);
            chrome.debugger.onEvent.removeListener(listener);
        };
    });
}


export {
    click,
    selectAllText,
    sendCommand,
    scrollIntoView,
    getCenterCoordinates,
    clickAtPosition,
    typeText,
    setValue,
    scroll,
    captureFixedAreaScreenshot,
    captureFullPageScreenshot,
    waitForPageLoadUsingDebugger
}