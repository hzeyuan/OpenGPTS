import { SG_SEARCH_URL } from '@opengpts/core/constant'
import { sendToBackground, type MessagesMetadata } from '@plasmohq/messaging'
import cheerio from 'cheerio'
import type { PlasmoCSConfig } from 'plasmo'
import Browser from 'webextension-polyfill'

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
}


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

export async function webSearch(search: SearchRequest, numResults: number): Promise<SearchResult[]> {
    console.log('Browser.runtime.id', Browser.runtime.id)
    const response: SearchResponse = await sendToBackground({
        name: 'get-search' as keyof MessagesMetadata,
        body: {
            search
        },
        extensionId: Browser.runtime.id
    })
    let results: SearchResult[]
    if (response.url.startsWith(SG_SEARCH_URL)) {
        results = htmlToSearchResults(response.html, numResults)
    } else {
        const result = await Browser.runtime.sendMessage({
            type: "get_webpage_text",
            url: response.url,
            html: response.html
        })

        return [{
            title: result.title,
            body: result.body,
            url: response.url
        }]
    }

    return results
}