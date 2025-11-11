import { Router } from 'express';

import { queryWithRAG } from '../services/langchain.js';

const router = Router();

/**
 * POST /query
 * Perform similarity search on Pinecone and get RAG response from ChatGPT
 */
router.post('/', async (req, res) => {
  try {
    const { question, namespace } = req.body || {};

    // Validate inputs
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: 'Question is required',
        message: 'Please provide a valid question',
      });
    }

    if (!namespace || typeof namespace !== 'string') {
      return res.status(400).json({
        error: 'Namespace is required',
        message: 'Please provide the namespace from your PDF upload',
      });
    }

    console.log(`Processing query in namespace ${namespace}: "${question}"`);

    // Perform RAG query
    // Note: Skip stats check to avoid propagation delay issues with new namespaces
    const result = await queryWithRAG(question, namespace);

    console.log(
      `Query completed: ${result.references.length} references found, reply length: ${result.reply.length} chars`,
    );

    // Return response
    return res.json({
      question,
      reply: result.reply,
      references: result.references,
      namespace,
    });
  } catch (error) {
    console.error('Query error:', error);

    // Handle specific errors
    if (error.message.includes('namespace') || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The specified namespace does not exist or has no vectors',
      });
    }

    // Generic error response
    return res.status(500).json({
      error: error.message || 'Failed to process query',
      message: 'An error occurred while processing your question',
    });
  }
});

export default router;
