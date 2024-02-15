

import { SG_SEARCH_URL } from "~src/constant"
import type { PlasmoMessaging } from "@plasmohq/messaging"
import cheerio from 'cheerio'


export interface SearchRequest {
    query: string
    timerange: string
    region: string
}

export interface SearchResponse {
    status: number
    html: string
    url: string
}

export interface SearchResult {
    title: string
    body: string
    url: string
}


function extractRealUrl(url: string): string {
    const match = url.match(/RU=([^/]+)/)
    if (match && match[1]) {
        return decodeURIComponent(match[1])
    }

    return url
}



function htmlToSearchResults(html: string, numResults: number): SearchResult[] {
    const $ = cheerio.load(html)
    const results: SearchResult[] = []

    const rightPanel = $('#right .searchRightTop')
    if (rightPanel.length) {
        const rightPanelLink = rightPanel.find('.compText a').first()
        const rightPanelInfo = rightPanel.find('.compInfo li')
        const rightPanelInfoText = rightPanelInfo
            .map((_, el) => $(el).text().trim())
            .get()
            .join('\n')

        results.push({
            title: rightPanelLink.text().trim(),
            body: `${rightPanel.find('.compText').text().trim()}${rightPanelInfoText ? `\n\n${rightPanelInfoText}` : ''}`,
            url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        })
    }

    $('.algo-sr:not([class*="ad"])')
        .slice(0, numResults)
        .each((_, el) => {
            const element = $(el)
            const titleElement = element.find('h3.title a')

            results.push({
                title: titleElement.attr('aria-label') ?? '',
                body: element.find('.compText').text().trim(),
                url: extractRealUrl(titleElement.attr('href') ?? ''),
            })
        })

    return results
}

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
    const searchRes = await htmlToSearchResults(html, 3)
    console.log('searchRes',searchRes)
    res.send({
        status: response.status,
        html,
        url: response.url
    })
    // res.send(result)
    // return
}

export default handler


