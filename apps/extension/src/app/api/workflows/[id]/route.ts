import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers"
import type { NextResponse } from 'next/server';
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing env variables')
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY!)

// delete workflow
export async function DELETE(req: Request, { params }: {
    params: {
        id: string
    }
}) {
    try {

        const { data, error } = await supabase.from('user_workflows').delete().eq('id', params?.id)
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


export async function POST(req: Request, { params }: {
    params: {
        id: string
    },
}, res: NextResponse) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        // const { data: { user } } = await supabase.auth.getUser()
        // if (!user) {
        //     const supabase = createRouteHandlerClient({ cookies })
        //     const { data: { user } } = await supabase.auth.getUser()
        //     if (!user) {
        //         return Response.json({ code: 401, message: 'Unauthorized' });
        //     }
        // }
        const payload = await req.json()
        // console.log('user', user,params.id, payload);
        const { data, error } = await supabase.from('user_workflows').update(
            payload
        ).eq('id', params?.id)
        .select();
        // .eq('uid', user?.id)
        console.log('update', data, )

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

export async function GET(req: Request, { params }: {
    params: {
        id: string
    }
}) {
    try {
        const { data, error } = await supabase.from('user_workflows')
            .select()
            .eq('id', params?.id)
            .single();
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