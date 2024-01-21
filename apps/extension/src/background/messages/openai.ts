import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage";
import Browser from "webextension-polyfill";
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { fetchSSE } from '~src/utils/fetch-sse.mjs'
import { ofetch } from 'ofetch'
import { Models, chatgptWebModelKeys } from "~src/constant";
import { message } from 'antd';
const storage = new Storage({
    area: "local",
    allCopied: true,
});


const createItem = async (newItem) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    console.log('newItem', newItem)
    await storage.setItem('gizmos', [newItem, ...items]);
};

const readItemById = async (id) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    return items.find(item => item.id === id);
};

const updateItem = async (id, updatedFields) => {
    let updatedItem;
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    const newItems = items.map(item => {
        if (item.id === id) {
            console.log('更新成功', item, updatedFields)
            updatedItem = { ...item, ...updatedFields };
            return updatedItem;
        }
        return item;
    });
    await storage.setItem('gizmos', newItems);
    return updatedItem;
};

const deleteItem = async (id) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    const newItems = items.filter(item => item.id !== id);
    await storage.setItem('gizmos', newItems);
}


export async function getModels() {
    const authorization = await storage.getItem('Authorization')
    try {
        const response = await ofetch(`https://chat.openai.com/backend-api/models`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
            },
        });

        if (response.models) {
            return response.models.map((m) => m.slug);
        }
        return { response };
    } catch (error) {
        console.error('Error during fetchData:', error);
        throw error;
    }
}


const createGPT = async (gizmo: Gizmo, tools: []) => {

    const authorization = await storage.getItem('Authorization')
    const apiUrl = `https://chat.openai.com/backend-api/gizmos`;
    const headers = {
        "accept": "*/*",
        "accept-language": "en-US",
        "authorization": `${authorization}`,
        "content-type": "application/json",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    };


    // 请求体
    const body = JSON.stringify({
        display: {
            ...gizmo.display,
            name: gizmo.display?.name || "",
            description: gizmo.display.description,
            prompt_starters: gizmo.display.prompt_starters || [],
            welcome_message: gizmo.display.welcome_message || "",
        },
        instructions: gizmo.instructions || "",
        tools: tools ? tools.map(tool => ({ type: tool })) : [
            {
                "type": "dalle"
            },
            {
                "type": "browser"
            }
        ],
        files: [],
        training_disabled: false
    });
    const data: {
        gizmo: Gizmo
    } = await ofetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: body,
    }).catch(error => {
        throw new Error('创建出错:' + error)
    })
    console.debug('创建成功:', data);
    return data.gizmo
}

const getGPT = async (gizmoId: string, draft) => {
    const authorization = await storage.getItem('Authorization')
    const apiUrl = `https://chat.openai.com/backend-api/gizmos/${gizmoId}`;

    const headers = {
        "accept": "*/*",
        "accept-language": "en-US",
        "authorization": `${authorization}`,
        "content-type": "application/json",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    };

    // 请求体

    return ofetch(apiUrl, {
        method: "GET",
        headers: headers,
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
        credentials: "include",
        query: {
            draft
        }
    })
        .catch(error => {
            console.error('获取出错:', error);
        });
}

const updateGPT = async (gizmoId: string, gizmo: Partial<Gizmo>, draft) => {

    const currentGPTInfo = await getGPT(gizmoId, draft)
    const authorization = await storage.getItem('Authorization')

    const apiUrl = `https://chat.openai.com/backend-api/gizmos?gizmo_id=${gizmoId}`;

    const headers = {
        "accept": "*/*",
        "accept-language": "en-US",
        "authorization": `${authorization}`,
        "content-type": "application/json",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    };


    // 请求体
    const body = JSON.stringify({
        display: {
            ...currentGPTInfo?.display,
            ...gizmo.display
        },
        instructions: gizmo.instructions || "",
        tools: currentGPTInfo?.tools || [],
        files: [],
        training_disabled: false,
    });

    try {
        const data = await ofetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: body,
        })
        await updateItem(gizmoId, gizmo)

        console.log('更新成功:', data);
        return data.gizmo;
    } catch (error) {
        console.error('更新出错:', error);
    }
};

const deleteGPT = async (gizmoId: string) => {
    const authorization = await storage.getItem('Authorization')

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
    await deleteItem(gizmoId)
    return {
        ok: true,
        error: ''
    };
}

const publishGPT = async (gizmoId: string) => {
    const authorization = await storage.getItem('Authorization')
    // API URL
    const apiUrl = `https://chat.openai.com/backend-api/gizmos/${gizmoId}/promote`;

    console.log('发布的网站url', apiUrl)

    await ofetch(apiUrl, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": `${authorization}`,
            "content-type": "application/json",
            "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        body: JSON.stringify({
            "sharing": {
                "recipient": "marketplace"
            },
            "categories": [
                "productivity"
            ]
        }),
    }).catch(error => {
        console.error('发布出错:', error);
    });
    return await updateItem(gizmoId, {
        tags: ['public']
    })

}

const getImageByImagePointer: (imagePointer: string) => Promise<string> = async (imagePointer) => {
    const authorization = await storage.getItem('Authorization')
    const result = await ofetch(`https://chat.openai.com/backend-api/files/${imagePointer}/download`, {
        headers: {
            "authorization": `${authorization}`,
        },
        retry: 3,
        retryDelay: 500, // ms
        timeout: 10000,
        ignoreResponseError: true,
        parseResponse: JSON.parse,
        method: 'GET',
    })
    return _.get(result, 'download_url')
}


export async function generateAnswersWithChatgptWebApi(session: {
    question: string;
    autoClean?: boolean;
    conversationId?: string;
    // conversationRecords: any[];
    messageId?: string;
    parentMessageId?: string;
    modelName?: string;
    gizmoId?: string;
}, authorization: string): Promise<{
    ok: boolean;
    data?: {
        text: string;
        imagePointers: string[];
    };
    error?: string
}> {
    session.messageId = uuidv4()
    if (session.parentMessageId == null) {
        session.parentMessageId = uuidv4()
    }
    const question = session.question
    if (!question) return {
        ok: false,
        error: `question is empty`
    }
    // const { controller, messageListener, disconnectListener } = setAbortController(port, null, () => {
    //     if (session.autoClean) deleteConversation(accessToken, session.conversationId)
    // })

    const config = await storage.getItem<Config>('config')

    if (!config) {
        return {
            ok: false,
            error: `config is empty`
        }
    }

    let usedModel = Models[(session?.modelName || 'chatgptFree35')].value


    if (session?.gizmoId) {
        usedModel = 'gpt-4-gizmo'
    }

    console.debug('usedModel', usedModel)

    let cookie, arkoseToken
    if (Browser.cookies && Browser.cookies.getAll)
        cookie = (await Browser.cookies.getAll({ url: 'https://chat.openai.com/' }))
            .map((cookie) => {
                return `${cookie.name}=${cookie.value}`
            })
            .join('; ')
    console.log('cookie', cookie)
    const needArkoseToken = !usedModel.includes(Models[chatgptWebModelKeys[0]].value)
    if (needArkoseToken) {
        if (!config?.chatgptArkoseReqUrl) {
            throw new Error(
                'Please login at https://chat.openai.com first' +
                '\n\n' +
                "Please keep https://chat.openai.com open and try again. If it still doesn't work, type some characters in the input box of chatgpt web page and try again.",
            )
        }
        arkoseToken = config?.chatgptArkoseReqUrl
            ? await fetch(config?.chatgptArkoseReqUrl + '?' + config.chatgptArkoseReqParams, {
                method: 'POST',
                body: config.chatgptArkoseReqForm,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
            })
                .then((resp) => resp.json())
                .then((resp) => resp.token)
                .catch(() => null)
            : null
        // console.debug('arkoseToken', arkoseToken)
        if (needArkoseToken && !arkoseToken)
            throw new Error(
                'Failed to get arkose token.' +
                '\n\n' +
                "Please keep https://chat.openai.com open and try again. If it still doesn't work, type some characters in the input box of chatgpt web page and try again.",
            )
    }

    let text = '', imagePointers: string[] = [];
    return new Promise((resolve, reject) => {
        return fetchSSE(`${config.customChatGptWebApiUrl}${config.customChatGptWebApiPath}`, {
            method: 'POST',
            // signal: controller.signal,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${authorization}`,
                ...(cookie && { Cookie: cookie }),
            },
            body: JSON.stringify({
                action: 'next',
                conversation_id: session?.conversationId || undefined,
                messages: [
                    {
                        id: session.messageId,
                        author: {
                            role: 'user',
                        },
                        content: {
                            content_type: 'text',
                            parts: [question],
                        },
                    },
                ],
                conversation_mode: session.gizmoId ? {
                    kind: "gizmo_interaction",
                    gizmo_id: session.gizmoId
                } : {
                    kind: 'primary_assistant',
                },
                force_paragen: false,
                force_rate_limit: false,
                suggestions: [],
                model: usedModel,
                parent_message_id: session.parentMessageId,
                timezone_offset_min: new Date().getTimezoneOffset(),
                history_and_training_disabled: config.disableWebModeHistory,
                arkose_token: arkoseToken,
            }),
            onMessage(message) {
                // console.debug('sse message', message)
                if (message.trim() === '[DONE]') {
                    // pushRecord(session, question, answer)
                    // console.log("answer", answer)
                    // console.debug('conversation history', { content: session.conversationRecords })
                    // port.postMessage({ answer: null, done: true, session: session })
                    resolve({ ok: true, data: { text, imagePointers } })
                    return text
                }
                let data
                try {
                    data = JSON.parse(message)
                } catch (error) {
                    console.debug('json error', error)
                    return
                }
                if (data.error) {
                    if (data.error.includes('unusual activity'))
                        throw new Error(
                            "Please keep https://chat.openai.com open and try again. If it still doesn't work, type some characters in the input box of chatgpt web page and try again.",
                        )
                    else throw new Error(data.error)
                }

                if (data.conversation_id) session.conversationId = data.conversation_id
                if (data.message?.id) session.parentMessageId = data.message.id
                // console.log('data.message', data.message)
                const imageAssetPointers = _.filter(_.get(data.message, 'content.parts', []), { 'content_type': 'image_asset_pointer' });
                // 从这些元素中提取asset_pointer值
                const newImagePointers: string[] = _.map(imageAssetPointers, 'asset_pointer');
                imagePointers = [...imagePointers, ...newImagePointers]
                const respAns = data.message?.content?.parts?.[0]
                if (respAns) text = respAns
                // if (answer) {
                //     console.log("中间 answer", answer)
                //     // port.postMessage({ answer: answer, done: false, session: null })
                // }
            },
            async onStart() {
                // sendModerations(accessToken, question, session.conversationId, session.messageId)
            },
            async onEnd() {
                // port.postMessage({ done: true })
                // port.onMessage.removeListener(messageListener)
                // port.onDisconnect.removeListener(disconnectListener)
                resolve({
                    ok: true,
                    data: {
                        text,
                        imagePointers
                    }
                })
            },
            async onError(resp) {
                console.debug('resp.status', resp.status)
                // port.onMessage.removeListener(messageListener)
                // port.onDisconnect.removeListener(disconnectListener)
                if (resp instanceof Error) throw resp

                if (resp.status === 403) {
                    reject(new Error('Authorization failed, please open or login https://chat.openai.com/  try again'))
                    return;
                }
                if (resp.status === 429) {
                    reject(new Error('Maybe You\'ve reached the current usage cap for GPT-4,'))
                    return;
                }
                const error = await resp.json().catch(() => ({}))
                reject(new Error(!_.isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`))
            },
        })
    })

}


const checkChatGPTsAuth: () => Promise<{
    ok: boolean;
    error?: string;
    data?: string;
}> = async () => {
    const config = await storage.getItem<Config>('config')
    console.log('chatgptArkoseReqUrl', config)
    if (!config?.chatgptArkoseReqUrl) {
        return {
            ok: false,
            error: 'Please  open Or login  https://chat.openai.com/ ',
            data: ''
        }
    }
    return {
        ok: true,
    }
}

const checkGPTWebAuth = async () => {
    const authorization = await storage.getItem('Authorization')
    if (!authorization) {
        return {
            ok: false,
            error: 'Please Chat with any GPTS https://chat.openai.com/gpts',
            data: ''
        }
    }
    return {
        ok: true,
    }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    let error = '';
    const { action, discovery, gizmoId, gizmo } = req.body;

    const authorization = await storage.getItem('Authorization')
    try {
        if (action === 'discovery') {
            const cursor = discovery.cursor
            console.log('cursor', cursor)
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

        } else if (action === 'delete') {
            const { ok, error } = await deleteGPT(gizmoId)
            res.send({
                ok,
                error
            })
        } else if (action === 'chatWithWeb') {
            const result = await generateAnswersWithChatgptWebApi(req.body.session, authorization)
            // console.log('result', result)
            res.send({
                ok: result.ok,
                error: '',
                data: result.data
            })

        } else if (action == 'getModels') {
            const models = await getModels()
            res.send({
                ok: true,
                error: '',
                data: models
            })
        } else if (action === 'update') {
            const { gizmoId, gizmo, draft } = req.body
            const data = await updateGPT(gizmoId, gizmo, draft)
            res.send({
                ok: true,
                error: '',
                data
            })
        } else if (action === 'publish') {
            const data = await publishGPT(gizmoId)
            res.send({
                ok: true,
                error: '',
                data
            })
        } else if (action === 'create') {
            const tools = req.body.tools || []
            const newGizmo = await createGPT(gizmo, tools)
            console.log('createGPT', newGizmo)
            await createItem(newGizmo)
            res.send({
                ok: true,
                error: '',
                data: gizmo
            })
        } else if (action === 'checkGPTWebAuth') {
            const result = await checkGPTWebAuth();
            res.send(result)
        } else if (action === 'checkChatGPTsAuth') {
            const result = await checkChatGPTsAuth()
            res.send(result)
        } else if (action === 'share') {
            const result = await ofetch(`https://open-gpts.vercel.app/api/gpts/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: { gizmo: gizmo }
            })
            if (result?.code === -1) {
                res.send({
                    ok: false,
                    error: result.message
                })
            }
            res.send({
                ok: true,
                error: '',
            })
        } else if (action === 'getImageByImagePointer') {
            const result = await getImageByImagePointer(req.body.imagePointer)
            res.send({
                ok: true,
                error: '',
                data: result
            })
        }
    } catch (error) {
        console.error('error', error)
        res.send({
            ok: false,
            error: error.message
        })
    }



}
export default handler


