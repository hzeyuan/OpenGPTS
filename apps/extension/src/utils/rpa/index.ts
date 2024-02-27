import type { SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody, WebEnvironment } from '@opengpts/types';
import { load } from 'cheerio'
import { isNumber, toNumber } from 'lodash-es';
import { sendToBackgroundViaRelay, type MessagesMetadata, type PlasmoMessaging } from '@plasmohq/messaging';
import type { Action } from '@opengpts/types/rpa/action';

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatElementsWithCheerio(elements: WebEnvironment['interactiveElements'] = []) {
    const outputElements = elements.map(e => e[0])

    const choices = outputElements?.map((elementStr, index) => {
        const $ = load(elementStr);
        const element = $(elementStr).first();
        const tagName = element[0]?.type === "tag" ? element[0].name : element[0]?.type;
        let textContent = element.text().trim();

        let attributesStr = "";

        // 根据元素类型保留关键属性
        const importantAttributes = [
            'title',        // 提示信息
            'name',         // 元素名称
            'placeholder',  // 占位符文本，通常用于input
            'alt',          // 图像的替代文本
            'src',          // 图像、音频或视频的来源URL
            'href',         // 链接目标URL
            'type',         // 元素类型，特别是在<input>元素中
            'value',        // 元素的值，对于<input>和<option>等元素很重要
            'role',         // ARIA角色，提供了关于元素如何在无障碍上下文中解释的信息
            'aria-label',   // 无障碍标签，对于不可见的文本很重要
            'aria-hidden',  // 表示元素是否对无障碍技术隐藏
            'data-*',       // 自定义数据属性，可能包含对理解元素很重要的数据
            'action',       // 表单提交的URL
            'method',       // 表单提交的方法（GET或POST）
            'target',       // 链接打开的位置
            'rel',          // 定义当前文档与链接文档之间的关系
            'download',     // 指示链接资源应该被下载
        ];

        importantAttributes.forEach(attr => {
            const attrValue = element.attr(attr);
            if (attrValue) {
                attributesStr += ` ${attr}="${attrValue}"`;
            }
        });


        // 构建并返回格式化后的元素字符串
        return [index, `<${tagName} ${attributesStr} id="${index}">${textContent}</${tagName}>`];
    });

    return choices;
}


const handleAction: (preprocessAction: Action, environment: WebEnvironment) => Action
    = (preprocessAction, environment) => {
        const { interactiveElements } = environment;
        const elements = interactiveElements?.map(e => e[0]);
        const ElementsUniqueSelectors = interactiveElements.map(e => e[1]);
        // 尝试解析成number

        let elementIndex = toNumber(preprocessAction['ELEMENT']);

        // 检查转换后的elementIndex是否为有效数字且在interactiveElements的索引范围内
        if (isNumber(elementIndex) && elementIndex >= 0 && elementIndex < ElementsUniqueSelectors.length) {
            const uniqueSelector = ElementsUniqueSelectors[elementIndex];
            return {
                ELEMENT: {
                    uniqueSelector: uniqueSelector,
                    outerHTML: elements[elementIndex]
                }, // Adjusted to return an object
                ACTION: preprocessAction['ACTION'],
                VALUE: preprocessAction['VALUE']
            };
        }
        return preprocessAction;
    }




function testElementScrollability(element: Element) {
    // 记录原始滚动位置
    const originalScrollTop = element.scrollTop;
    const originalScrollLeft = element.scrollLeft;

    // 尝试垂直滚动
    element.scrollTo({
        top: originalScrollTop + 1,
        behavior: 'instant'
    });
    // 检查垂直滚动是否成功
    const canScrollVertically = element.scrollTop !== originalScrollTop;

    // 恢复原始垂直滚动位置
    element.scrollTo({
        top: originalScrollTop,
        behavior: 'instant'
    });

    // 尝试水平滚动
    element.scrollTo({
        left: originalScrollLeft + 1,
        behavior: 'instant'
    });
    // 检查水平滚动是否成功
    const canScrollHorizontally = element.scrollLeft !== originalScrollLeft;

    // 恢复原始水平滚动位置
    element.scrollTo({
        left: originalScrollLeft,
        behavior: 'instant'
    });

    return canScrollVertically || canScrollHorizontally

}




function withRetry(fn: { (): Promise<any>; (): Promise<any>; }, maxAttempts = 3, delay = 1000) {
    let attempts = 0;

    function attempt() {
        attempts++;
        return fn().catch((error: any) => {
            if (attempts < maxAttempts) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(attempt());
                    }, delay);
                });
            } else {
                throw error;
            }
        });
    }

    return attempt();
}




async function invokeFuncFromBGSW(name: keyof MessagesMetadata, additionalBody: Partial<SendToBackgroundViaRelayRequestBody>) {
    console.log(`%c[invoke] Function called with  ${name}`, 'color: blue; font-weight: bold;');

    // PlasmoMessaging.Request<string, > 
    // 构建请求体
    const requestBody: PlasmoMessaging.Request<keyof MessagesMetadata, any> = {
        name,
        body: {
            ...additionalBody,
        },
    };

    // 记录发送的请求体
    console.log('%c[invoke] Sending request with body:', 'color: teal;', requestBody);

    try {
        // 发送请求并等待响应
        const response = await sendToBackgroundViaRelay<SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody>(requestBody);

        // 检查响应状态码，记录响应详情
        if (response.code !== 0) {
            console.error(`%c[invoke] Request failed with status ${response.code}: ${response.message}`, 'color: red; font-weight: bold;');
            throw new Error(`Request failed with status ${response.code}: ${response.message}`);
        }

        // 请求成功，记录成功的响应
        console.log('%c[invoke] Request succeeded with response:', 'color: green; font-weight: bold;', response.data);

        // 返回响应数据
        return response.data;
    } catch (error) {
        // 捕获到异常，记录错误信息
        console.error('%c[invoke] Error during request:', 'color: red; font-weight: bold;', error);
        throw error; // 重新抛出错误，允许调用者处理
    }
}




const checkPageAndJsLoaded = (tabId: number, options: { timeout: number; maxAttempts: number; }) => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = options.timeout || 500; // 设置间隔默认值
        const maxAttempts = options.maxAttempts || 20; // 设置最大尝试次数默认值

        const checkTabLoaded = () => {
            chrome.tabs.get(tabId, (tab) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                if (tab.status === 'complete') {
                    // 页面已加载，等待load事件确认
                    chrome.scripting.executeScript({
                        target: { tabId },
                        world: "MAIN",
                        func: () => {
                            return new Promise((resolve) => {
                                if (document.readyState === 'complete') {
                                    resolve(true); // 页面已加载，无需等待
                                } else {
                                    window.addEventListener('load', () => resolve(true));
                                }
                            });
                        },
                    }, (results) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
                            return;
                        }
                        // 成功执行脚本并且页面加载完成
                        if (results && results[0]?.result) {
                            resolve(tab);
                        } else {
                            reject(new Error('加载完成事件未被确认'));
                        }
                    });
                } else if (attempts < maxAttempts) {
                    console.log(`重试`)
                    setTimeout(checkTabLoaded, interval);
                    attempts++;
                } else {
                    reject(new Error('页面加载超时'));
                }
            });
        };

        checkTabLoaded(); // 开始检查
    });
};


export {
    formatElementsWithCheerio,
    handleAction,
    withRetry,
    invokeFuncFromBGSW,
    testElementScrollability,
    checkPageAndJsLoaded
}
