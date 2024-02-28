
import { NextRequest, NextResponse } from "next/server";
const crypto = require('crypto');

export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  
export async function POST(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {
    const data = await req.json()
    console.log('req',data)
    const headers = req.headers.get('X-Signature')

    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });
  
    await new Promise((resolve) => req.on('end', resolve));
  
    // 现在 rawBody 包含了原始的请求体
    console.log(rawBody);
  
  

    console.log('headers',headers)
    const secret    = 'usesless';
    const hmac      = crypto.createHmac('sha256', secret);
    const digest    = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(headers || '', 'utf8');

    if (!crypto.timingSafeEqual(digest, signature)) {
        throw new Error('Invalid signature.');
    }

    return Response.json(data)
}


export async function GET(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {

    console.log('req',req.url)
    const { name } = params
    console.log('123', req)
    return Response.json(req.url)
}
