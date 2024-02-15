import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage";
import _ from 'lodash-es';
import { ofetch } from 'ofetch'
import type { ChatConfig, Gizmo } from '@opengpts/types'
import { OpenAI } from "~src/utils/web";

const storage = new Storage({
    area: "local",
    allCopied: true,
});



const createGPTs = async (newItem: Partial<Gizmo>) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    console.log('newItem', newItem)
    await storage.setItem('gizmos', [newItem, ...items]);
};

const getGPTsById = async (id: string) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    return items.find(item => item.id === id);
};

const updateGPTs = async (id: string, updatedFields: Partial<Gizmo>) => {
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

const deleteGPTs = async (id:string) => {
    const items = await storage.getItem<Gizmo[]>('gizmos') || [];
    const newItems = items.filter(item => item.id !== id);
    await storage.setItem('gizmos', newItems);
}

const checkChatGPTsAuth: () => Promise<{
    ok: boolean;
    error?: string;
    data?: string;
}> = async () => {
    const config = await storage.getItem<ChatConfig>('config')
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
    const chatgptConfig = await storage.getItem<ChatConfig>('chatgpt-config')
    if (!chatgptConfig?.token) {
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

    const chatgptConfig = await storage.getItem<ChatConfig>('chatgpt-config');
    const token = chatgptConfig?.token;
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
            } catch (error: any) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        } else if (action === 'delete') {
            try {
                await openai.gpt.del(gizmoId);
                await deleteGPTs(gizmoId)
                res.send({
                    ok: true
                })
            } catch (error: any) {
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
                await updateGPTs(gizmoId, newGizmo)
                res.send({
                    ok: true,
                    data: gizmo
                })
            } catch (error:any) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }

        } else if (action === 'publish') {
            try {
                console.log('gizmoId', gizmoId)
                await openai.gpt.publish(gizmoId)
                await updateGPTs(gizmoId, {
                    tags: ['public']
                })
                res.send({ ok: true, data: '' })
            } catch (error:any) {
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
                await createGPTs(newGizmo)
                res.send({
                    ok: true,
                    data: newGizmo
                })
            } catch (error:any) {
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
            } catch (error:any) {
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
            } catch (error:any) {
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
            } catch (error:any) {
                res.send({
                    ok: false,
                    error: error.message
                })
            }
        }
    } catch (error:any) {
        console.error('error', error)
        res.send({
            ok: false,
            error: error.message
        })
    }



}
export default handler


