import browser, { type Tabs, type Windows } from 'webextension-polyfill';
import { customAlphabet } from 'nanoid/non-secure';

export async function getActiveTab(): Promise<Tabs.Tab | null> {
    console.log(`%c [getActiveTab]`, 'color: #ff00ff');
    try {
        let windowId: number | null = null;
        const tabsQuery: Tabs.QueryQueryInfoType = {
            active: true,
            url: '*://*/*',
        };
        const extURL: string = browser.runtime.getURL('');
        const windows: Windows.Window[] = await browser.windows.getAll({ populate: true });
        console.log(`%c [getActiveTab] windows`, 'color: #ff00ff', windows);
        for (const browserWindow of windows) {
            const [tab] = browserWindow.tabs || [];
            const isDashboard = browserWindow.tabs && browserWindow.tabs.length === 1 && tab.url?.includes(extURL);

            if (isDashboard) {
                await browser.windows.update(browserWindow.id!, {
                    focused: false,
                });
            } else if (browserWindow.focused && browserWindow.id !== undefined) {
                windowId = browserWindow.id as number; // Add type assertion here
            }
        }

        if (windowId !== null) {
            tabsQuery.windowId = windowId;
        } else if (windows.length > 2) {
            tabsQuery.lastFocusedWindow = true;
        }

        const [tab] = await browser.tabs.query(tabsQuery);
        console.log(`%c [getActiveTab] tab`, 'color: #ff00ff', tab);
        return tab || null;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export function objectHasKey(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

export function toCamelCase(str: string, capitalize = false) {
    const result = str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index === 0 && !capitalize
            ? letter.toLowerCase()
            : letter.toUpperCase();
    });

    return result.replace(/\s+|[-]/g, '');
}

export function isWhitespace(str: string) {
    return !/\S/.test(str);
}


export function sleep(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
}

export function parseJSON(data, def) {
    try {
        const result = JSON.parse(data);

        return result;
    } catch (error) {
        return def;
    }
}


export function messageSandbox(type, data = {}) {
    const nanoid = customAlphabet('1234567890abcdef', 5);

    return new Promise((resolve) => {
        const messageId = nanoid();

        const iframeEl = document.getElementById('sandbox');
        iframeEl.contentWindow.postMessage({ id: messageId, type, ...data }, '*');

        const messageListener = ({ data: messageData }) => {
            if (messageData?.type !== 'sandbox' || messageData?.id !== messageId)
                return;

            window.removeEventListener('message', messageListener);

            resolve(messageData.result);
        };

        window.addEventListener('message', messageListener);
    });
}


export function findTriggerBlock(drawflow = {}) {
    if (!drawflow) return null;

    if (drawflow.drawflow) {
        const blocks = Object.values(drawflow.drawflow?.Home?.data ?? {});
        if (!blocks) return null;

        return blocks.find(({ name }) => name === 'trigger');
    }
    if (drawflow.nodes) {
        return drawflow.nodes.find((node) => node.label === 'trigger');
    }

    return null;
}

export function isXPath(str) {
    const regex = /^([(/@]|id\()/;

    return regex.test(str);
}


export function visibleInViewport(element) {
    const { top, left, bottom, right, height, width } =
        element.getBoundingClientRect();

    if (height === 0 || width === 0) return false;

    return (
        top >= 0 &&
        left >= 0 &&
        bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}


export function attachDebugger(tabId, prevTab) {
    return new Promise((resolve) => {
      if (prevTab && tabId !== prevTab)
        chrome.debugger.detach({ tabId: prevTab });
  
      chrome.debugger.attach({ tabId }, '1.3', () => {
        chrome.debugger.sendCommand({ tabId }, 'Page.enable', resolve);
      });
    });
  }
  