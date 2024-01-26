import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage";
import _ from 'lodash'
import { ofetch } from 'ofetch'
import type { Config, Gizmo } from '@repo/types'
import { OpenAI } from '@opengpts/core'

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

const isLogin = async () => {
    const authorization = await storage.getItem('chatgpt-token')
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

    const token = await storage.getItem('chatgpt-token');
    const openai = new OpenAI({ token })

    const { action, discovery, gizmoId, gizmo } = req.body;

    try {
        if (action === 'getGPTsList') {
            try {
                const { gizmos, cursor } = await openai.gpt.list(discovery.cursor)
                const oldGizmos = await storage.getItem<Gizmo[]>('gizmos')
                const mergedGizmos = _.unionBy(oldGizmos, gizmos, 'id');
                await storage.setItem('gizmos', mergedGizmos)
                res.send({
                    ok: true,
                    data: {
                        gizmos,
                        cursor,
                    },
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        } else if (action === 'delete') {
            try {
                await openai.gpt.del(gizmoId);
                await deleteItem(gizmoId)
                res.send({
                    ok: true
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        } else if (action === 'chat') {
            const session = req.body.session;

            await openai.gpt.call(session).then(data => {
                res.send({
                    ok: true,
                    error: '',
                    data: data
                })
            }).catch(error => {
                res.send({
                    ok: false,
                    error: error.message
                })
            })

        } else if (action == 'getModels') {
            const models = openai.getModels()
            res.send({
                ok: true,
                error: '',
                data: models
            })
        } else if (action === 'update') {
            try {
                const { gizmoId, gizmo, draft } = req.body
                const newGizmo = await openai.gpt.update(gizmoId, gizmo)
                await updateItem(gizmoId, newGizmo)
                res.send({
                    ok: true,
                    data: gizmo
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }

        } else if (action === 'publish') {
            try {
                console.log('gizmoId', gizmoId)
                await openai.gpt.publish(gizmoId)
                await updateItem(gizmoId, {
                    tags: ['public']
                })
                res.send({ ok: true, data: '' })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }

        } else if (action === 'create') {
            try {
                const tools = req.body.tools || []
                const newGizmo = await openai.gpt.create(gizmo, tools)
                console.log('createGPT', newGizmo)
                await createItem(newGizmo)
                res.send({
                    ok: true,
                    data: newGizmo
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        } else if (action === 'isLogin') {
            const result = await isLogin();
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
            try {
                const downloadUrl = await OpenAI.getImageByImagePointer(req.body.imagePointer);
                res.send({
                    ok: true,
                    error: '',
                    data: downloadUrl
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        } else if (action === 'deleteConversation') {
            try {
                await openai.conversation.delete(req.body.conversationId)
                res.send({
                    ok: true,
                    error: '',
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })

            }
        } else if (action === 'uploadImg') {
            try {
                const downloadUrl = await openai.uploadImg(req.body.imageUrl)
                res.send({
                    ok: true,
                    error: '',
                    data: downloadUrl
                })
            } catch (error) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
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


