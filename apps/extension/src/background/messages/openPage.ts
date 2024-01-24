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
    const { url, }: {
        url: string,
    } = req.body
    const tab = await chrome.tabs.create({ url, active: false, pinned: true })
    res.send({
        tabId: tab.id,
    })
}



export default handler
