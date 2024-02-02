// import Browser from "webextension-polyfill";
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import { fetchSSE } from '../lib/fetch-sse.mjs'
import { type $Fetch, ofetch } from 'ofetch'
import type { ChatConfig, Gizmo, Session } from '@opengpts/types'


interface WebStreamEvent {
    onStart?: () => void,
    onMessage?: ({ text, imagePointers }: {
        done: boolean,
        session: Session,
        text: string
        imagePointers?: string[]
    }) => void,
    onFinish?: ({ conversation }: {
        conversation: Conversation
    }) => void
    onError?: (error: Error) => void
    onAbort?: () => void
}



interface APIkeyStreamEvent {
    onStart?: () => void,
    onMessage?: ({ text, imagePointers }: {
        done: boolean,
        text: string
        imagePointers?: string[]
    }) => void,
    onFinish?: () => void
    onError?: (error: Error) => void
    onAbort?: () => void
}

class OpenAI {
    public gpt: GPT
    public conversation: Conversation

    token: string | undefined
    apiFetch: $Fetch

    constructor({
        token
    }: {
        token?: string
    }) {

        this.token = token
        if (!this.token) throw new Error('ChatGPT403')
        this.apiFetch = ofetch.create({
            baseURL: "`https://chat.openai.com",
            retry: 3,
            retryDelay: 500, // ms
            timeout: 100000,
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "accept": "*/*",
                "accept-language": "en-US",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                referrerPolicy: "strict-origin-when-cross-origin",
                "referrer": "https://chat.openai.com",
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            },
            parseResponse: JSON.parse,
            onResponseError: ({ request, response, options }) => {
                if (response.status === 403) {
                    throw new Error(`Please open or login https://chat.openai.com/  try again`)
                }
            },
        });
        this.conversation = new Conversation({
            apiFetch: this.apiFetch,
            token: this.token
        });
        this.gpt = new GPT({
            apiFetch: this.apiFetch,
            token: this.token,
            conversation: this.conversation
        });
    }

    public static getImageByImagePointer: (imagePointer: string) => Promise<string> = async (imagePointer) => {
        const result = await ofetch(`https://chat.openai.com/backend-api/files/${imagePointer}/download`, {
            timeout: 10000,
            method: 'GET',
        }).catch(err => {
            throw new Error(err.message);
        })
        return _.get(result, 'download_url')
    }

    public async getModels() {
        const response = await ofetch(`https://chat.openai.com/backend-api/models`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            },
        }).catch(err => {
            throw new Error(err.message)
        })
        if (response.models) {
            return response.models.map((m: { slug: any; }) => m.slug);
        }
        return { response };
    }


    public static async callWithApiKey({ apiKey, baseUrl, event, request }: {
        event?: APIkeyStreamEvent;
        apiKey: string;
        baseUrl: string;
        request: {
            controller?: AbortController | null,
            body: any
        }
    }) {
        const onAbortHandler = () => {
            event?.onAbort && event.onAbort();
            request?.controller?.signal.removeEventListener('abort', onAbortHandler);
        };
        request?.controller && request?.controller.signal.addEventListener('abort', onAbortHandler);

        let text = '', imagePointers: string[] = [];
        const response = await new Promise((resolve, reject) => {
            return fetchSSE(`${baseUrl}`, {
                method: 'POST',
                signal: request?.controller?.signal,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    ...request.body
                }),
                onMessage(message: string) {
                    if (message.trim() === '[DONE]') {
                        resolve({ done: true, text, imagePointers })
                        return
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
                                "Please keep https://chat.openai.com open and try again.",
                            )
                        else throw new Error(data.error)
                    }
                    // const imageAssetPointers = _.filter(_.get(data.message, 'content.parts', []), { 'content_type': 'image_asset_pointer' });
                    // 从这些元素中提取asset_pointer值
                    // const newImagePointers: string[] = _.map(imageAssetPointers, 'asset_pointer');
                    // imagePointers = [...imagePointers, ...newImagePointers]
                    text += data.choices?.[0]?.delta?.content || ''
                    event?.onMessage && event.onMessage({
                        done: false,
                        text,
                        imagePointers,
                    });
                },
                async onStart() {
                    event?.onStart && event?.onStart();
                    // sendModerations(accessToken, question, session.conversationId, session.messageId)
                },
                async onFinish() {
                    event?.onFinish && event?.onFinish();
                    resolve({
                        done: true,
                        text,
                        imagePointers,
                    })
                },
                async onError(resp: Response | Error) {
                    request?.controller && request?.controller.signal.removeEventListener('abort', onAbortHandler)

                    if (resp instanceof Error) {
                        reject(resp)
                        return
                    }
                    console.debug('resp.status', resp.status, resp.ok)
                    if (resp.status === 404) {
                        reject(new Error('chatGPT404'))
                        return;
                    }
                    if (resp.status === 403) {
                        reject(new Error('chatGPT403'))
                        return;
                    }
                    if (resp.status === 429) {
                        reject(new Error('chatGPT429'))
                        return;
                    } if (resp.status === 404) {

                    }
                    const error = await resp.json().catch(() => ({}))
                    reject(new Error(!_.isEmpty(error) ? JSON.stringify(resp) : `${resp.status} ${resp.statusText}`))
                }
            })
        }).catch(error => {
            console.log('fetch-sse', error)
            if (error.message === 'Failed to fetch') {
                throw new Error('chatGPT404')
            }
            throw error
        });
        return response as any;

    }

    /**
     * Uploads an image to the server.
     * @param imageUrl The URL of the image to upload.
     * @returns The download URL of the uploaded image.
     * @throws If there is an error during the upload process.
     */
    public async uploadImg(imageUrl: string): Promise<string> {

        //0. check image url format
        if (!imageUrl.startsWith('http')) {
            throw new Error(`Image url format error:${imageUrl}`)
        }
        const response = await fetch(imageUrl, {
            headers: { mode: 'no-cors' }
        }).catch(error => {
            throw new Error(error.message)
        })
        // 1.get image blob 
        const blob = await response.blob();
        // 2. build pre-upload request
        const { file_id, upload_url, status } = await this.apiFetch(`https://chat.openai.com/backend-api/files`, {
            method: "POST",
            body: JSON.stringify({
                "file_name": imageUrl.split('/').pop(),
                "file_size": blob?.size,
                "use_case": "profile_picture"
            })
        }).catch(err => {
            throw new Error(`build pre-upload request error:${err.message}`)
        })
        if (status !== 'success') {
            throw new Error(`build pre-upload request error:${status}`)
        }
        // 3. upload image
        await ofetch(upload_url, {
            method: 'PUT',
            body: blob,
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "content-type": "image/png",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "x-ms-blob-type": "BlockBlob",
                "x-ms-version": "2020-04-08"
            },
            // "referrer":`https://chat.openai.com/gpts/editor/${}`,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "mode": "cors",
            "credentials": "omit"
        }).catch(err => {
            throw new Error(`Upload image error:${err.message}`)
        })

        // 4. confirm upload，get download_url
        const imgRes = await this.apiFetch(`https://chat.openai.com/backend-api/files/${file_id}/uploaded`, {
            method: "POST",
        }).catch(err => {
            throw new Error(`Confirm upload error:${err.message}`)
        })
        return imgRes.download_url
    }

    get isLogin() {
        return !!this.token
    }
}



class Conversation {

    token: string | undefined
    apiFetch: $Fetch

    constructor(config: {
        token?: string,
        apiFetch: $Fetch
    }) {
        this.token = config.token
        this.apiFetch = config.apiFetch
    }

    public async delete(conversationId: string): Promise<boolean> {
        if (!conversationId) return false
        return await this.apiFetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_visible: false }),
        }).then(res => {
            if (!res.success) {
                throw new Error(res.message)
            }
            return true
        }).catch(error => {
            throw new Error(error.message)
        })
    }

    public updateTitle(conversationId: string, title: string) {
        if (!conversationId) return false
        this.apiFetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                title,
            })
        }).then(res => {
            if (!res.success) {
                throw new Error(res.message)
            }
            console.log('updateTitle', res)
        }).catch(err => {
            console.error('updateTitle', err)
            throw new Error(err.message)
        })
    }

}


class GPT {

    token: string | undefined

    conversation?: Conversation
    apiFetch: $Fetch

    constructor(config: {
        apiFetch: $Fetch,
        token?: string,
        conversation?: Conversation
    }) {
        this.token = config.token

        this.apiFetch = config.apiFetch

        this.conversation = config.conversation

    }

    private ensureAuthenticated() {
        if (!this.token) {
            throw new Error('Authentication token is missing. Please log in.');
            // Or return a specific response indicating the need for authentication
        }
    }

    public async list(cursor = null): Promise<{ gizmos: Gizmo[], cursor: string }> {
        this.ensureAuthenticated();
        let error = '';
        const reqUrl = cursor ? `https://chat.openai.com/public-api/gizmos/discovery/mine?cursor=${cursor}&limit=10` : `https://chat.openai.com/backend-api/gizmos/discovery`
        const data = await this.apiFetch(reqUrl, {
        }).catch(err => {
            error = '[fetch GPTs]:' + err
        })
        if (data?.detail ===
            "Could not parse your authentication token. Please try signing in again."
        ) {
            error = `Please open or login https://chat.openai.com/  try again`
        }
        let gizmos: Gizmo[] = !cursor ? _.get(data, 'cuts[0].list.items', []) : _.get(data, 'list.items', [])
        gizmos = gizmos.map((item: any) => {
            const gizmo = _.get(item, 'resource.gizmo', {})
            const profilePictureUrl = _.get(gizmo, 'display.profile_picture_url', '')
            if (profilePictureUrl) {
                const profilePicId = profilePictureUrl.replace('https://files.oaiusercontent.com/', '').split('?')[0]
                return {
                    ...gizmo,
                    display: {
                        ...gizmo.display,
                        profile_pic_id: profilePicId,
                    }
                }
            }
            return { ...gizmo }
        })

        const newCursor = !cursor ? _.get(data, 'cuts[0].list.cursor', '') : _.get(data, 'list.cursor', '')

        // const oldGizmos = await storage.getItem<Gizmo[]>('gizmos')
        // const mergedGizmos = _.unionBy(oldGizmos, gizmos, 'id');
        return {
            gizmos: gizmos,
            cursor: newCursor
        }
    }

    public async get(id: string, draft = false): Promise<{
        gizmo: Gizmo,
        tools: any
    }> {
        const apiUrl = `https://chat.openai.com/backend-api/gizmos/${id}`;

        const data = await this.apiFetch(apiUrl, {
            method: "GET",
            query: {
                draft
            }
        }).catch(error => {
            console.error('获取出错:', error);
        });
        return {
            gizmo: data.gizmo,
            tools: data.tools
        }
    }

    public async del(id: string): Promise<boolean> {
        const result = await this.apiFetch(`https://chat.openai.com/backend-api/gizmos/${id}`, {
            method: 'DELETE',
        }).catch(error => {
            throw new Error(error.message)
        })
        console.log(`删除${id}成功`, result)
        return true;
    }

    public async update(id: string, gizmo: {
        display: Partial<Gizmo['display']>,
        instructions?: string
    }): Promise<Gizmo> {
        // 这里默认draft为true

        const currentGPTInfo = await this.get(id, true).catch(err => {
            throw new Error('Before Update,get GPT info error')
        })
        const apiUrl = `https://chat.openai.com/backend-api/gizmos?gizmo_id=${id}`;
        console.log('currentGPTInfo', currentGPTInfo)
        const body = JSON.stringify({
            display: {
                ...currentGPTInfo?.gizmo?.display,
                ...gizmo.display
            },
            instructions: gizmo?.instructions || "",
            tools: currentGPTInfo?.tools || [],
            files: [],
            training_disabled: false,
        });
        const data = await this.apiFetch(apiUrl, {
            method: "POST",
            body: body,
        }).catch(error => {
            console.error('更新出错:', error);
            throw new Error(error.message)
        })
        return data.gizmo;
    }

    public async create(gizmo: Partial<{
        display?: Partial<Gizmo['display']>,
        instructions?: string
    }>, files: string[] = [], tools: string[] = [
        "dalle",
        "browser"
    ]): Promise<Gizmo> {
        const apiUrl = `https://chat.openai.com/backend-api/gizmos`;
        // 请求体
        const body = JSON.stringify({
            display: {
                ...gizmo.display,
                name: gizmo.display?.name || "",
                description: gizmo.display?.description,
                prompt_starters: gizmo.display?.prompt_starters || [],
                welcome_message: gizmo.display?.welcome_message || "",
            },
            instructions: gizmo?.instructions || "",
            tools: tools.map(tool => ({ type: tool })),
            files: [],
            training_disabled: false
        });
        const data: {
            gizmo: Gizmo
        } = await this.apiFetch(apiUrl, {
            method: "POST",
            body: body,
        }).catch(error => {
            throw new Error('创建出错:' + error)
        })
        console.debug('创建成功:', data);
        return data.gizmo
    }

    public async publish(id: string, categories = []): Promise<boolean> {
        const apiUrl = `https://chat.openai.com/backend-api/gizmos/${id}/promote`;

        return this.apiFetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({
                "sharing": {
                    "recipient": "marketplace"
                },
                "categories": [
                    "productivity"
                ]
            })
        })
            .then(res => {
                return true
            })
            .catch(error => {
                console.error('发布出错:', error);
                throw new Error(error.message)
            });
    }


    public async call(session: Session, event?: WebStreamEvent, config?: ChatConfig, options?: {
        controller?: AbortController | null
    }): Promise<{
        done: boolean,
        text?: string;
        imagePointers?: string[];
        session: Session
        error?: string
    }> {
        session.messageId = uuidv4()
        if (session.parentMessageId == null) {
            session.parentMessageId = uuidv4()
        }
        const question = session.question
        if (!question) return {
            done: false,
            session,
            error: `question is empty`
        }

        // const controller = new AbortController();

        // Define the abort event handler
        const onAbortHandler = () => {
            event?.onAbort && event.onAbort();
            options?.controller?.signal.removeEventListener('abort', onAbortHandler);
            if (session.autoClean && session.conversationId) {
                this.conversation?.delete(session.conversationId);
            }
        };
        options?.controller && options?.controller.signal.addEventListener('abort', onAbortHandler);

        let usedModel = 'text-davinci-002-render-sha'
        if (session?.modelName === 'chatgptPlus4Browsing') {
            usedModel = 'gpt-4'
        } else if (session?.modelName === 'chatgptPlus4') {
            usedModel = 'gpt-4-gizmo'
        }
        if (session?.gizmoId) {
            usedModel = 'gpt-4-gizmo'
        }

        console.debug('usedModel', usedModel)


        let cookie: string, arkoseToken: string;
        // if (Browser.cookies && Browser.cookies.getAll)
        //     cookie = (await Browser.cookies.getAll({ url: 'https://chat.openai.com/' }))
        //         .map((cookie) => {
        //             return `${cookie.name}=${cookie.value}`
        //         })
        //         .join('; ')
        // console.log('cookie', cookie)
        const needArkoseToken = usedModel !== 'chatgptFree35'
        if (needArkoseToken) {
            const errorMsg = 'noChatGPTPlusArkoseToken'
            if (!config?.chatgptArkoseReqUrl) {
                throw new Error(errorMsg);
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
                throw new Error(errorMsg);
        }
        const conversationInstance = this.conversation
        let text = '', imagePointers: string[] = [];
        const response = await new Promise((resolve, reject) => {
            return fetchSSE(`${config?.customChatGptWebApiUrl}${config?.customChatGptWebApiPath}`, {
                method: 'POST',
                signal: options?.controller?.signal,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
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
                    history_and_training_disabled: config?.disableWebModeHistory || false,
                    arkose_token: arkoseToken,
                }),
                onMessage(message: string) {
                    // console.debug('sse message', message)
                    if (message.trim() === '[DONE]') {
                        // console.log("answer", answer)
                        // console.debug('conversation history', { content: session.conversationRecords })
                        // port.postMessage({ answer: null, done: true, session: session })
                        resolve({ done: true, text, imagePointers, session })
                    }
                    console.debug('message', message)
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
                                "Please keep https://chat.openai.com open and try again.",
                            )
                        else throw new Error(data.error)
                    }

                    if (data.conversation_id) session.conversationId = data.conversation_id
                    if (data.message?.id) session.parentMessageId = data.message.id

                    const imageAssetPointers = _.filter(_.get(data.message, 'content.parts', []), { 'content_type': 'image_asset_pointer' });
                    // 从这些元素中提取asset_pointer值
                    const newImagePointers: string[] = _.map(imageAssetPointers, 'asset_pointer');
                    imagePointers = [...imagePointers, ...newImagePointers]
                    const respAns = data.message?.content?.parts?.[0]
                    if (respAns) text = respAns

                    event?.onMessage && event.onMessage({
                        done: false,
                        text,
                        imagePointers,
                        session
                    });
                },
                async onStart() {
                    event?.onStart && event?.onStart();
                    // sendModerations(accessToken, question, session.conversationId, session.messageId)
                },
                async onFinish() {
                    event?.onFinish && event?.onFinish({ conversation: conversationInstance });
                    resolve({
                        done: true,
                        text,
                        imagePointers,
                        session
                    })
                },
                async onError(resp: Response | Error) {
                    options?.controller && options?.controller.signal.removeEventListener('abort', onAbortHandler)

                    if (resp instanceof Error) {
                        reject(resp)
                        return
                    }
                    console.debug('resp.status', resp.status, resp.ok)
                    if (resp.status === 404) {
                        reject(new Error('chatGPT404'))
                        return;
                    }
                    if (resp.status === 403) {
                        reject(new Error('chatGPT403'))
                        return;
                    }
                    if (resp.status === 429) {
                        reject(new Error('chatGPT429'))
                        return;
                    } if (resp.status === 404) {

                    }
                    const error = await resp.json().catch(() => ({}))
                    reject(new Error(!_.isEmpty(error) ? JSON.stringify(resp) : `${resp.status} ${resp.statusText}`))
                }
            })
        }).catch(error => {
            console.log('fetch-sse', error)
            if (error.message === 'Failed to fetch') {
                throw new Error('chatGPT404')
            }
            throw error
        });
        if (session?.autoClean && session?.conversationId) this.conversation?.delete(session?.conversationId)
        return response as any;
    }



}



export {
    GPT,
    Conversation,
    OpenAI,
    type WebStreamEvent,
    type APIkeyStreamEvent
}

