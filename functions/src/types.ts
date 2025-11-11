import type { FieldValue } from 'firebase-admin/firestore';

export interface DocumentMetadata {
  docId: string;
  ownerId: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  namespace: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  chunksIndexed?: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface RagChatRequest {
  docId: string;
  question: string;
  topK?: number;
}

export interface RagChatResponse {
  reply: string;
  references: Array<{
    rank: number;
    score: number | undefined;
    textPreview: string;
  }>;
}
