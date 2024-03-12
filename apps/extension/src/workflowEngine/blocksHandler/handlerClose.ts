import browser from 'webextension-polyfill';


async function closeTab(data, tabId) {
    let tabIds;

    if (data?.activeTab && tabId) {
        tabIds = tabId;
    } else if (data.url) {
        tabIds = (await browser.tabs.query({ url: data.url })).map((tab) => tab.id);
    }

    if (tabIds) await browser.tabs.remove(tabIds);
}


async function handler({ data, id }) {
    console.log('handlerClose', data, id, this)
    await closeTab(data, this.activeTab.id);

    if (data.activeTab) {
        this.activeTab.id = null;
    }

    return {
        data: '',
        nextBlockId: this.getBlockConnections(id),
    };
}

export default handler;