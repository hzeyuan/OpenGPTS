import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from '@plasmohq/storage'

export type RequestBody = {
}

export type RequestResponse = number

const storage = new Storage({
    area: 'local',
    allCopied: true,
});


const handler = async (req, res) => {
    const { url, gptInfo, options }: {
        url: string,
        gptInfo: GPTInfo,
        options,
    } = req.body
    const tab = await chrome.tabs.create({ url, active: false })


    const newGptInfo = {
        ...gptInfo,
        logs: [],
        status: 'init',
        id: '',
        tabId: tab.id!.toString(),
    }
    await storage.setItem(`page_${tab.id}`, {
        url,
        gptInfo: newGptInfo,
        options,
    })

    // await storage.clear();

    const gptsStats = await storage.getItem<GPTsStats>('GPTsStats') || {}

    gptsStats['gpts'] = gptsStats['gpts'] || {}

    console.log('tabId', tab.id)
    if (tab?.id) {
        gptsStats.gpts[tab.id!.toString()] = newGptInfo

        console.log('gptsStats', gptsStats, newGptInfo, tab)

        await storage.setItem('GPTsStats', gptsStats)

        console.log('存储成功', tab.id!.toString(), req.body)
    }
    res.send({
        tabId: tab.id,
    })
}



export default handler
