import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { transformMessages } from '@opengpts/core/utils';
import { type ChatCompletionCreateParams } from 'openai/resources';
import _ from 'lodash';
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {


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