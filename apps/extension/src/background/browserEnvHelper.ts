import type { GetBrowserEnv, GetEnv, InteractiveElement } from '@opengpts/types';





const getEnv: GetEnv = () => {
    const interactiveElements: InteractiveElement[] = window['getInteractiveElementsFromWindow']()

    console.log('topLevelInteractiveElements', interactiveElements, window['uniqueSelector'])

    // 返回映射后的元素，包括元素本身和它的文本内容
    const sanitizedInteractiveElements: [string, string, string][] = interactiveElements.map(item => [
        item?.element.outerHTML,
        window['uniqueSelector'](item?.element),
        item?.element?.tagName,
    ]);
    console.log('topLevelInteractiveElements', sanitizedInteractiveElements.length, interactiveElements)

    // 当前可视区域的大小
    const interactiveRect = {
        x: 0,
        y: 0,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    }

    // 整个网页的大小
    const rect = {
        x: 0,
        y: 0,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
    }

    const scrollElements = window['getScrollableContainers']().filter((element: Element) => window['testElementScrollability'](element)).map((ele: Element) => {
        const shallowCopy = document.createElement(ele.tagName);
        return [
            shallowCopy.outerHTML,
            window['uniqueSelector'](ele),
            ele.tagName
        ]
    })

    return {
        // bodyOuterHTML: document.documentElement.outerHTML,
        interactiveElements: sanitizedInteractiveElements,
        scrollElements: scrollElements,
        interactiveRect,
        rect,
    }
}

export const getBrowserEnv:GetBrowserEnv = (tabId: number) => {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: {
                    tabId: tabId // the tab you want to inject into
                },
                world: "MAIN", // MAIN to access the window object
                func: getEnv,
            },
            (resps) => {
                console.log('results', resps)
                const pageInfo = resps[0]
                console.log("Background script got callback after injection,results", resps)
                resolve({
                    // frameId: pageInfo.frameId,
                    ...pageInfo?.result
                })
            }
        )

    })

}