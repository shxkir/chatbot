import OpenAI from 'openai';

import { env, requireEnv } from '../config/env.js';

requireEnv(['OPENAI_API_KEY']);

const client = new OpenAI({ apiKey: env.openaiApiKey });
const DEFAULT_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';

export async function embedTexts(texts, model = DEFAULT_EMBED_MODEL) {
  if (!Array.isArray(texts) || !texts.length) {
    throw new Error('No texts provided for embeddings');
  }
  const response = await client.embeddings.create({
    input: texts,
    model,
  });
  return response.data.map((item) => item.embedding);
}

export async function chatWithContext(promptMessages, model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini') {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: promptMessages,
  });
  return completion.choices?.[0]?.message?.content?.trim() || '';
}
