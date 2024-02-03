import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { transformMessages } from '@opengpts/core/utils';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {
  const payload = await req.json();
  let model = 'gpt-3.5-turbo-16k'
  if (payload?.model === 'ChatGPT3.5 Turbo') {
    model = 'gpt-3.5-turbo-16k'
  } else if (payload?.model === 'ChatGPT4 Turbo') {
    model = 'gpt-4-0613'
  }

  const body = transformMessages(payload)
  console.log('body', body)
  const response = await openai.chat.completions.create({
    model: model || 'gpt-3.5-turbo',
    stream: true,
    messages: body.messages,

  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}