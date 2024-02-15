export type RequestBody = {
}

export type RequestResponse = number



const handler = async (req: { body: { url: string } }, res: { send: (arg0: { tabId: number | undefined }) => void }) => {
    const { url, }: {
        url: string,
    } = req.body
    const tab = await chrome.tabs.create({ url, active: false, pinned: true })
    res.send({
        tabId: tab.id,
    })
}



export default handler
