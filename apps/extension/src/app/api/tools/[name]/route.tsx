
import supabase from "~src/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, { params }) {
    try {
        // 从 URL 参数中获取工具的ID
        const { name } = params

        if (!name) {
            return NextResponse.json({
                code: -1,
                message: 'Tool name is required'
            });
        }

        // 使用工具的ID从数据库中检索工具的信息
        const { data: tool, error } = await supabase
            .from('tools')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            return NextResponse.json({
                code: -1,
                message: error.message
            });
        }

        if (!tool) {
            return NextResponse.json({
                code: -1,
                message: 'Tool not found'
            });
        }

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: tool
        });
    } catch (error) {
        console.error('error', error);
        return NextResponse.json({
            code: -1,
            message: 'An error occurred'
        });
    }
}
