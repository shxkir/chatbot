import OpenAI from 'openai';

import { env } from './env';

const client = new OpenAI({
  apiKey: env.openaiApiKey,
});

const DEFAULT_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
const DEFAULT_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

export async function embedTexts(texts: string[], model = DEFAULT_EMBED_MODEL) {
  if (!texts.length) {
    return [];
  }
  const response = await client.embeddings.create({
    input: texts,
    model,
  });
  return response.data.map((item) => item.embedding);
}

export async function generateChatResponse(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], model = DEFAULT_CHAT_MODEL) {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages,
  });
  return completion.choices[0]?.message?.content?.trim() ?? '';
}
