import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type UploadResponse = {
  message: string;
  docId: string;
  namespace: string;
  chunksIndexed: number;
};

export type QueryResponse = {
  reply: string;
  references: Array<{
    rank: number;
    score?: number;
    textPreview: string;
  }>;
};

export async function uploadPdf(file: File, namespace?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (namespace) {
    formData.append('namespace', namespace);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Network error contacting /api → ${API_BASE_URL}`);
    }
    throw error;
  }
}

export async function queryChat(message: string, namespace: string): Promise<QueryResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/query`, {
      message,
      namespace,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || `Network error contacting /api → ${API_BASE_URL}`);
    }
    throw error;
  }
}
