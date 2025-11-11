import { Router } from 'express';
import multer from 'multer';

import { processPdfWithLangChain } from '../services/langchain.js';

const router = Router();

// Configure multer for file uploads (25MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

/**
 * POST /upload
 * Upload PDF, extract text, chunk with RecursiveCharacterTextSplitter,
 * create embeddings, and store in Pinecone with namespace pdf_<timestamp>
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'PDF file is required',
        message: 'Please upload a PDF file',
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only PDF files are supported',
      });
    }

    console.log(`Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);

    // Process PDF with LangChain
    const result = await processPdfWithLangChain(req.file.buffer, req.file.originalname);

    console.log(
      `Successfully processed PDF: ${result.chunksIndexed} chunks stored in namespace ${result.namespace}`,
    );

    // Return success response
    return res.json({
      message: 'PDF processed successfully',
      namespace: result.namespace,
      fileName: result.fileName,
      chunksIndexed: result.chunksIndexed,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific errors
    if (error.message.includes('extract text')) {
      return res.status(422).json({
        error: 'Could not extract text from PDF',
        message: 'The PDF might be image-based or corrupted',
      });
    }

    // Generic error response
    return res.status(500).json({
      error: error.message || 'Failed to process PDF',
      message: 'An error occurred while processing your PDF',
    });
  }
});

export default router;
