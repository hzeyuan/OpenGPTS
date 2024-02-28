import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import _ from 'lodash-es';
import { transformMessages } from '~src/utils';
import { authMiddleware } from '~src/middlewares/authMiddleware';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
export const runtime = 'edge';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE_URL
});

const redis = new Redis({
  url: process.env.UPSTASH_URL!,
  token: process.env.UPSTASH_TOKEN!,
})

export async function POST(req: NextRequest) {


  await authMiddleware(req);

  // if (!req.user) {
  //   return NextResponse.json({
  //     code: 401,
  //     message: "Unauthorized"
  //   })
  // }

  const clientIP = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || req.ip;

  redis.incr(`api:chat:${clientIP}`)

  const count = _.toInteger(await redis.get(`api:chat:${clientIP}`));
  console.log('count', count)
  const freeCount = _.toInteger(process.env.FREE_CHAT_COUNT || 30);
  if (count && freeCount > count) {
    return NextResponse.json({
      code: 429,
      message: "IP request limit exceeded. Please Login to increase your rate limit."
    })
  }



  const payload = await req.json();
  let model = 'gpt-3.5-turbo-16k-0613'
  if (payload?.model === 'ChatGPT3.5 Turbo') {
    model = 'gpt-3.5-turbo-0613'
  } else if (payload?.model === 'ChatGPT4 Turbo') {
    model = 'gpt-4-0613'
  }
  const chatCompletions: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
    model: model || 'gpt-3.5-turbo-16k-0613',
    stream: true,
    messages: [],
  }

  if (!payload.messages) {

  }

  const messages = transformMessages(payload.messages)
  chatCompletions['messages'] = messages

  if (_.isArray(payload.functions) && payload.functions.length > 0) {
    chatCompletions['functions'] = payload.functions

  }
  const response = await openai.chat.completions.create(chatCompletions)


  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}