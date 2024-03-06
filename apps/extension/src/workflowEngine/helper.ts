import browser from 'webextension-polyfill';


export function waitTabLoaded({ tabId, listenError = false, ms = 10000 }: { tabId: number, listenError?: boolean, ms?: number }) {
    return new Promise((resolve, reject) => {
        let timeout: NodeJS.Timeout;
        const excludeErrors = ['net::ERR_BLOCKED_BY_CLIENT', 'net::ERR_ABORTED'];

        const onErrorOccurred = (details: any) => {
            if (
                details.tabId !== tabId ||
                details.frameId !== 0 ||
                excludeErrors.includes(details.error as string)
            )
                return;

            clearTimeout(timeout as NodeJS.Timeout);
            browser.webNavigation.onErrorOccurred.removeListener(onErrorOccurred);
            reject(new Error(details.error));
        };

        if (ms > 0) {
            timeout = setTimeout(() => {
                browser.webNavigation.onErrorOccurred.removeListener(onErrorOccurred);
                reject(new Error('Timeout'));
            }, ms);
        }
        // if (listenError && BROWSER_TYPE === 'chrome')
        //     browser.webNavigation.onErrorOccurred.addListener(onErrorOccurred);

        const activeTabStatus = () => {
            browser.tabs.get(tabId).then((tab) => {
                if (!tab) {
                    reject(new Error('no-tab'));
                    return;
                }

                if (tab.status === 'loading') {
                    setTimeout(() => {
                        activeTabStatus();
                    }, 1000);
                    return;
                }

                clearTimeout(timeout);

                browser.webNavigation.onErrorOccurred.removeListener(onErrorOccurred);
                resolve();
            });
        };

        activeTabStatus();
    });
}




/**
 * Attaches the debugger to a specific tab and enables debugging for that tab.
 * If a previous tab is provided, it detaches the debugger from the previous tab before attaching to the new tab.
 * @param tabId - The ID of the tab to attach the debugger to.
 * @param prevTab - The ID of the previous tab. If provided, the debugger will be detached from this tab before attaching to the new tab.
 * @returns A Promise that resolves when the debugger is attached and debugging is enabled for the tab.
 */
export function attachDebugger(tabId: number, prevTab?: number): Promise<void> {
    return new Promise((resolve) => {
        if (prevTab !== undefined && tabId !== prevTab) {
            chrome.debugger.detach({ tabId: prevTab }, () => { });
        }

        chrome.debugger.attach({ tabId: tabId }, '1.3', () => {
            chrome.debugger.sendCommand({ tabId: tabId }, 'Page.enable', {}, () => {
                resolve();
            });
        });
    });
}



export function sendDebugCommand(tabId: number, method: string, params: object = {}): Promise<any> {
    return new Promise((resolve) => {
        chrome.debugger.sendCommand({ tabId }, method, params, resolve);
    });
}




type injectPreloadScript = (props: {
    target: chrome.scripting.InjectionTarget;
    scripts: any;
    frameSelector?: string;
}) => Promise<browser.Scripting.InjectionResult[]>


export const injectPreloadScript: injectPreloadScript = ({ target, scripts, frameSelector }) => {

    return browser.scripting.executeScript({
        target,
        world: "MAIN",
        args: [scripts, frameSelector || null],
        func: (preloadScripts, frame) => {
            let $documentCtx = document;

            if (frame) {
                const iframeCtx = document.querySelector(frame)?.contentDocument;
                if (!iframeCtx) return;

                $documentCtx = iframeCtx;
            }

            preloadScripts.forEach((script) => {
                const scriptAttr = `block--${script.id}`;

                const isScriptExists = $documentCtx.querySelector(
                    `.automa-custom-js[${scriptAttr}]`
                );

                if (isScriptExists) return;

                const scriptEl = $documentCtx.createElement('script');
                scriptEl.textContent = script.data.code;
                scriptEl.setAttribute(scriptAttr, '');
                scriptEl.classList.add('automa-custom-js');

                $documentCtx.documentElement.appendChild(scriptEl);
            });
        },
    });
}