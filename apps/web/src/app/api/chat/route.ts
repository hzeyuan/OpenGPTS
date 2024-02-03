import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { transformMessages } from '@opengpts/core/utils';
import { ChatCompletionCreateParams } from 'openai/resources/index.mjs';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE_URL
});

export async function POST(req: Request) {


  const functions: ChatCompletionCreateParams.Function[] = [
    {
      name: 'get_current_weather',
      description: 'Get the current weather',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          format: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description:
              'The temperature unit to use. Infer this from the users location.',
          },
        },
        required: ['location', 'format'],
      },
    },
  ];

  const payload = await req.json();
  let model = 'gpt-3.5-turbo-16k-0613'
  if (payload?.model === 'ChatGPT3.5 Turbo') {
    model = 'gpt-3.5-turbo-0613'
  } else if (payload?.model === 'ChatGPT4 Turbo') {
    model = 'gpt-4-0613'
  }

  const body = transformMessages(payload)
  console.log('body', body)
  const response = await openai.chat.completions.create({
    model: model || 'gpt-3.5-turbo-16k-0613',
    stream: true,
    messages: body.messages,
    functions,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}