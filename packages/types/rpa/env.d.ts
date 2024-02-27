type WebEnvironment = {
    interactiveElements: [string, string, string][],
    interactiveRect: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    rect: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    scrollElements?: [string, string, string][]
    screenshot?: string,
}

type GetEnv = () => WebEnvironment
type GetBrowserEnv = (tabId: number) => Promise<WebEnvironment>


export {
    GetEnv,
    GetBrowserEnv,
    WebEnvironment
}