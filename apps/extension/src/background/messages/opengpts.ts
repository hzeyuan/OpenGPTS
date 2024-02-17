export type RequestBody = {
    type: string
    data: any
}

export type RequestResponse = any
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const handler = async (req: {
    body: RequestBody
}, res: RequestResponse) => {
    // session 中添加key
    // const { url } = req.body
    const { type, data } = req.body
    console.log("req.body", req.body)
    if (type == 'SIGNED_IN' || type === 'INITIAL_SESSION') {
        // 同步数据到cookies
        console.log('SIGNED_IN', data)
        storage.setItem("opengpts-user", data)
    } else if (type == 'SIGNED_OUT') {
        // 清除cookies
        console.log('SIGNED_OUT', data)
        storage.removeItem("opengpts-user")
    } else if (type === 'PASSWORD_RECOVERY') {

    } else if (type === 'TOKEN_REFRESHED') {

    } else if (type === 'USER_UPDATED') {

    }
}



export default handler
