import type { Database } from "@opengpts/types/supabase";
import supabase from "~src/utils/supabase";

export async function GET(req: Request) {
    try {
        let { data: tools, error } = await supabase.from('tools').select('*')
        console.log('data',tools)
        if (error) {
            return Response.json({
                code: -1,
                message: error.message
            })
        }
        return Response.json({
            code: 0,
            message: "success",
            data: tools
        })
    } catch (error) {
        console.log('error', error)
    }
}

export async function POST(req: Request) {
    const row: Database['public']['Tables']['tools']['Row'] =  await req.json()
    const { data, error } = await supabase
        .from('tools')
        .insert(row)
    if (error) {
        return Response.json({
            code: -1,
            message: error.message
        })
    }
    return Response.json({
        code: 0,
        message: "success",
        data: data
    })
}