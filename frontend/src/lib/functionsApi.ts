import axios from 'axios';

const FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL ||
  `https://${process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1'}-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

function withAuth(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

type RegisterUploadPayload = {
  fileName: string;
  storagePath: string;
  downloadUrl: string;
};

export async function registerUpload(payload: RegisterUploadPayload, token: string) {
  const response = await axios.post(`${FUNCTIONS_BASE_URL}/uploadFile`, payload, withAuth(token));
  return response.data as { docId: string; namespace: string; storagePath: string; downloadUrl: string };
}

export async function processPdf(payload: { docId: string }, token: string) {
  const response = await axios.post(`${FUNCTIONS_BASE_URL}/processPDF`, payload, withAuth(token));
  return response.data as { docId: string; chunksIndexed: number; namespace: string };
}

export async function ragChat(payload: { docId: string; question: string }, token: string) {
  const response = await axios.post(`${FUNCTIONS_BASE_URL}/ragChat`, payload, withAuth(token));
  return response.data as {
    reply: string;
    references: Array<{ rank: number; score?: number; textPreview: string }>;
  };
}
