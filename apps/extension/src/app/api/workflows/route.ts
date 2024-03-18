import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers';




export async function POST(req: Request) {
    try {
        const workflow = await req.json();
        const supabase = createRouteHandlerClient({ cookies })
        const { data, error } = await supabase.from('user_workflows').insert({
            ...workflow,
        })

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
    } catch (error: any) {
        return Response.json({
            code: -1,
            message: error.message
        })
    }
}



export async function GET(req: Request) {

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        throw new Error('Missing env variables')
    }
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY!)
    try {
        const { data, error } = await supabase.from('user_workflows').select()
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
    } catch (error: any) {
        return Response.json({
            code: -1,
            message: error.message
        })
    }
}
