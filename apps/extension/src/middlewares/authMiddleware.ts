import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server'






export async function authMiddleware(req: NextRequest) {
    console.log('req', req)
    const cookieStore = cookies()
    // 初始化Supabase客户端
    const supabase = createServerComponentClient({
        cookies: () => cookieStore,
    })
    console.log('xxxxx')
    const { data } = await supabase.auth.getUser()
    console.log('user', data)
    if (data?.user) {
        // 用户已登录，添加用户信息到请求中
        req.user = data?.user
    }
    return NextResponse.next();
}
