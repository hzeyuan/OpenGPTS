import browser from 'webextension-polyfill';
import { waitTabLoaded, fileSaver } from '../helper';
import { BROWSER_TYPE } from '~src/constant';

interface SaveImageOptions {
    filename?: string;
    uri: string;
    ext?: string;
}

interface ScreenshotData {
    quality?: number;
    ext?: string;
    saveToComputer?: boolean;
    saveToColumn?: boolean;
    dataColumn?: string;
    fileName?: string;
    captureActiveTab?: boolean;
    fullPage?: boolean;
    type?: string;
    selector?: string;
    variableName?: string;
    assignVariable?: boolean;
}

interface TakeScreenshotOptions {
    data: ScreenshotData;
    id: string;
    label: string;
}

async function saveImage({ filename, uri, ext }: SaveImageOptions): Promise<void> {
    const hasDownloadAccess = await browser.permissions.contains({
        permissions: ['downloads'],
    });
    const name = `${filename || 'Screenshot'}.${ext || 'png'}`;

    if (hasDownloadAccess) {
        await browser.downloads.download({
            url: uri,
            filename: name,
        });

        return;
    }


    
    const image = new Image();

    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        fileSaver(name, canvas.toDataURL());
    };

    image.src = uri;
}

async function takeScreenshot({ data, id, label }: TakeScreenshotOptions): Promise<any> {
    console.log('takeScreenshot')
    const saveToComputer =
        typeof data.saveToComputer === 'undefined' || data.saveToComputer;

    try {
        let screenshot = null;
        const options = {
            quality: data.quality,
            format: data.ext || 'png',
        };
        const saveScreenshot = async (dataUrl: string): Promise<void> => {
            if (data.saveToColumn) this.addDataToColumn(data.dataColumn, dataUrl);
            if (saveToComputer)
                await saveImage({
                    filename: data.fileName,
                    uri: dataUrl,
                    ext: data.ext,
                } as SaveImageOptions);
            if (data.assignVariable)
                await this.setVariable(data.variableName, dataUrl);
        };

        if (data.captureActiveTab) {
            if (!this.activeTab.id) {
                throw new Error('no-tab');
            }

            let tab = null;
            const isChrome = BROWSER_TYPE === 'chrome';
            const captureTab = async () => {
                let result = null;

                if (isChrome) {
                    result = await browser.tabs.captureVisibleTab(tab.windowId, options);
                } else {
                    result = await browser.tabs.captureTab(this.activeTab.id, options);
                }

                return result;
            };

            if (isChrome) {
                [tab] = await browser.tabs.query({
                    active: true,
                    url: '*://*/*',
                });

                if (this.windowId) {
                    await browser.windows.update(this.windowId, { focused: true });
                }
            }

            await browser.tabs.update(this.activeTab.id, { active: true });
            await waitTabLoaded({ tabId: this.activeTab.id, listenError: true });

            screenshot = await (data.fullPage ||
                ['element', 'fullpage'].includes(data.type)
                ? this._sendMessageToTab({
                    label,
                    options,
                    data: {
                        type: data.type,
                        selector: data.selector,
                    },
                    tabId: this.activeTab.id,
                })
                : captureTab());

            if (tab) {
                await browser.windows.update(tab.windowId, { focused: true });
                await browser.tabs.update(tab.id, { active: true });
            }

            await saveScreenshot(screenshot);
        } else {
            screenshot = await browser.tabs.captureVisibleTab(options);

            await saveScreenshot(screenshot);
        }

        return {
            data: screenshot,
            nextBlockId: this.getBlockConnections(id),
        };
    } catch (error) {
        if (data.type === 'element') error.data = { selector: data.selector };

        throw error;
    }
}

export default takeScreenshot;
