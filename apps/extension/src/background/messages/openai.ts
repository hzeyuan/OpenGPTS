import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage";
import _ from 'lodash'
import { ofetch } from 'ofetch'
const storage = new Storage({
    area: "local",
    allCopied: true,
});


const deleteGPT = async (gizmoId: string) => {
    const authorization = await storage.getItem('Authorization')
    try {
        const result = await ofetch(`https://chat.openai.com/backend-api/gizmos/${gizmoId}`, {
            headers: {
                "authorization": `${authorization}`,
                "accept-language": "en-US",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                "sec-ch-ua-mobile": "?0",
                "accept": "*/*",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
            },
            retry: 3,
            retryDelay: 500, // ms
            timeout: 10000,
            ignoreResponseError: true,
            parseResponse: JSON.parse,
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
        })
        console.log(`删除${gizmoId}成功`, result)
        const gizmos = await storage.getItem<Gizmo[]>('gizmos')
        const newGizmos = gizmos.filter(item => item.id !== gizmoId)
        await storage.setItem('gizmos', newGizmos);
        return {
            ok: true,
            error: ''
        };
    } catch (error) {
        return {
            ok: false,
            error: '请求错误' + error
        }
    }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

    let error = '';
    const { action, discovery, gizmoId } = req.body;

    console.log("触发openai");
    const authorization = await storage.getItem('Authorization')

    if (action === 'discovery') {
        const cursor = discovery.cursor
        console.log('cursor', cursor)
        try {

            const reqUrl = cursor ? `https://chat.openai.com/public-api/gizmos/discovery/mine?cursor=${cursor}&limit=10` : `https://chat.openai.com/backend-api/gizmos/discovery`
            const data = await ofetch(reqUrl, {
                headers: {
                    "authorization": `${authorization}`,
                    "accept": "*/*",
                    "accept-language": "en-US",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    // 'referer': window.location.href,
                    referrerPolicy: "strict-origin-when-cross-origin",
                    "referrer": "https://chat.openai.com/gpts/mine",
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "include"
                },
                retry: 3,
                retryDelay: 500, // ms
                timeout: 30000,
                ignoreResponseError: true,
                parseResponse: JSON.parse,
                async onRequestError({ request, options, error }) {
                    console.log("[fetch request error]", request, error);
                    
                }
            }).catch(err => {
                error = '请求错误' + err
            })
            if (data?.detail ===
                "Could not parse your authentication token. Please try signing in again."
            ) {
                error = '请重新打开openai页面'
            }
            const gpts = !cursor ? _.get(data, 'cuts[0].list.items', []) : _.get(data, 'list.items', [])
            const newCursor = !cursor ? _.get(data, 'cuts[0].list.cursor', '') : _.get(data, 'list.cursor', '')

            // 这里提取gpts中resource.gizmo
            const gizmos: Gizmo[] = gpts.map((item: any) => {
                return _.get(item, 'resource.gizmo', {})
            })
            const oldGizmos = await storage.getItem<Gizmo[]>('gizmos')

            const mergedGizmos = _.unionBy(oldGizmos, gizmos, 'id');
            await storage.setItem('gizmos', mergedGizmos);

            console.log('data', data, 'newCursor', newCursor)
            res.send({
                ok: true,
                error,
                data: {
                    gizmos,
                    cursor: newCursor,
                },
            })
        } catch (error) {
            console.log('error', error)
            res.send({
                ok: false,
                error: '请求错误' + error
            })
        }
    } else if (action === 'delete') {
        const { ok, error } = await deleteGPT(gizmoId)
        res.send({
            ok,
            error
        })
    }
}


export default handler


