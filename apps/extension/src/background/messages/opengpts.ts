export type RequestBody = {
    type: string
    data: any
}

export type RequestResponse = any
import { Storage } from "@plasmohq/storage"
import { opengptsStorage } from '~src/store';


const handler = async (req: {
    body: RequestBody
}, res: RequestResponse) => {
    const { type, data } = req.body
    console.log("req.body", req.body)
    if (type == 'SIGNED_IN' || type === 'INITIAL_SESSION') {
        console.log('SIGNED_IN', data)
        opengptsStorage.setItem("opengpts-user", data)
    } else if (type == 'SIGNED_OUT') {
        // 清除cookies
        console.log('SIGNED_OUT', data)
        opengptsStorage.removeItem("opengpts-user")
    } else if (type === 'PASSWORD_RECOVERY') {

    } else if (type === 'TOKEN_REFRESHED') {

    } else if (type === 'USER_UPDATED') {

    }
}



export default handler
