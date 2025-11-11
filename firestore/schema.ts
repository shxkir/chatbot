import type { Timestamp } from 'firebase-admin/firestore';

export interface PdfDocument {
  docId: string;
  ownerId: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  namespace: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  chunksIndexed?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RagReference {
  rank: number;
  score?: number;
  textPreview: string;
}

export interface RagHistoryEntry {
  docId: string;
  ownerId: string;
  question: string;
  answer: string;
  references: RagReference[];
  createdAt: Timestamp;
}

export const firestoreCollections = {
  documents: 'documents',
  ragHistory: 'ragHistory',
} as const;
