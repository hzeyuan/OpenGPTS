
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {
    const { name } = params
    const data = await req.json()
    if (name === 'get_current_weather') {
        const { location, format } = data

        // 等待5秒
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 1000)
        })


        return NextResponse.json({
            code: 0,
            message: 'success',
            data: {
                location,
                format: format || 'celsius',
                description: ['sunny', 'cloudy', 'rainy', 'foggy'][Math.floor(Math.random() * 4)],
            }
        });
    } else if (name === 'dalle2') {
        return NextResponse.json({
            code: 0,
            message: 'success',
            data: {
                title: 'a cat',
                img: 'https://pic3.zhimg.com/80/v2-a573570cb6c8f4276963850682528632_1440w.webp'
            }
        });
    } else {
        return NextResponse.json({
            code: -1,
            message: 'error',
            data: {}
        })
        // Handle other cases or return an error
    }
}


export async function GET(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {
    const { name } = params
    console.log('123', name)
    return Response.json({
        'message': 'hello world' + name
    })
}
