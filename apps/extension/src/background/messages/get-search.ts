

import { SG_SEARCH_URL } from "@opengpts/core/constant"
import type { PlasmoMessaging } from "@plasmohq/messaging"


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const { query, timerange } = req.body.search
    // res.send(result)
    const params = new URLSearchParams({
        q: query,
        btf: timerange,
        nojs: '1',
        ei: 'UTF-8',
    })
    const response = await fetch(`${SG_SEARCH_URL}?${params.toString()}`)
    console.log('response', response)
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    // console.log('html', html)
    // return { status: response.status, html: await response.text(), url: response.url }
    res.send({
        status: response.status,
        html,
        url: response.url
    })
    // res.send(result)
    // return
}

export default handler


