import { sendHttpRequest } from "~src/utils";
import supabase from "~src/utils/supabase";

export async function POST(req: Request) {
    const { tool_name, data } = await req.json();
    const resp = await supabase.from('tools').select('*').eq('name', tool_name)
    if (resp.error) {
        return Response.json({
            code: -1,
            message: resp.error.message
        })
    }
    if (resp.data.length === 0) {
        return Response.json({
            code: -1,
            message: 'Tool not found'
        })
    }
    const toolRow = resp.data[0]
    console.log('toolRow', toolRow, data)
    try {
        const content: string = await sendHttpRequest(toolRow, data)
        return Response.json({
            code: 0,
            message: "success",
            data: content
        })
    } catch (error: any) {
        console.log('error', error.message)
        return Response.json({
            code: -1,
            message: error.message
        })
    }

}

