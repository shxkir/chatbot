import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type LangChainUploadResponse = {
  message: string;
  namespace: string;
  fileName: string;
  chunksIndexed: number;
};

export type LangChainQueryResponse = {
  question: string;
  reply: string;
  references: Array<{
    rank: number;
    score: number;
    textPreview: string;
    source: string;
  }>;
  namespace: string;
};

/**
 * Upload PDF and process with LangChain
 * Uses RecursiveCharacterTextSplitter and stores in Pinecone with namespace pdf_<timestamp>
 */
export async function uploadPdfWithLangChain(file: File): Promise<LangChainUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/langchain/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for large PDFs
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg =
        error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(`Upload failed: ${errorMsg}`);
    }
    throw error;
  }
}

/**
 * Query using RAG (Retrieval-Augmented Generation)
 * Performs similarity search and gets ChatGPT response
 */
export async function queryWithLangChain(
  question: string,
  namespace: string,
): Promise<LangChainQueryResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/langchain/query`, {
      question,
      namespace,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg =
        error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(`Query failed: ${errorMsg}`);
    }
    throw error;
  }
}
