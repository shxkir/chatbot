import { Router } from 'express';

import { embedTexts, chatWithContext } from '../services/embeddings.js';
import { queryVectors } from '../services/pinecone.js';

const router = Router();
const DEFAULT_TOP_K = Number(process.env.RETRIEVAL_TOP_K || 5);

router.post('/', async (req, res) => {
  try {
    const { message, namespace } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!namespace) {
      return res.status(400).json({ error: 'Namespace (docId) is required' });
    }

    const [queryEmbedding] = await embedTexts([message]);
    const pineconeResponse = await queryVectors(queryEmbedding, namespace, DEFAULT_TOP_K);
    const matches = pineconeResponse.matches || [];
    if (!matches.length) {
      return res.json({ reply: 'No relevant context found for that question.', references: [] });
    }

    const context = matches
      .map((match, idx) => `Snippet ${idx + 1}: ${match.metadata?.text || ''}`)
      .join('\n\n');

    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that only uses the provided context snippets to answer questions. If the context is insufficient, say so clearly.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${message}\nAnswer using only the context.`,
      },
    ];

    const reply = await chatWithContext(messages);

    return res.json({
      reply,
      references: matches.map((match, idx) => ({
        rank: idx + 1,
        score: match.score,
        textPreview: match.metadata?.text?.slice(0, 200) || '',
      })),
    });
  } catch (error) {
    console.error('Chat error', error);
    return res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

export default router;
