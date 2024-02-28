
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
const crypto = require('crypto');

export const config = {
  api: {
    bodyParser: false,
  },
};




export async function POST(req: NextRequest,
  res: NextResponse
) {
  // const data = await req.json()
  // console.log('req', data)
  const headers = req.headers.get('X-Signature') || ''

  const rawBody = await req.text()


  // 现在 rawBody 包含了原始的请求体
  console.log(rawBody);



  console.log('headers', headers)
  const secret = 'usesless';
  const hmac = crypto.createHmac('sha256', secret);
  // Generate the digest as a Buffer directly rather than converting from hex string to Buffer
  const digest = hmac.update(rawBody).digest();

  // Assuming `headers` contains the hex representation of the HMAC signature
  // Convert `headers` string to Buffer for comparison
  const signature = Buffer.from(headers, 'hex');

  // Now both `digest` and `signature` are Buffers, you can safely compare them
  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error('Invalid signature.');
  }

  const data = JSON.parse(rawBody);
  console.log('Processed Data:', data);


  return Response.json(data)
  // res.status(200).json({})
}


