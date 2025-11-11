import { Request } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';

import { adminAuth } from './firebase';

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new HttpsError('unauthenticated', 'Missing or invalid Authorization header.');
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new HttpsError('unauthenticated', 'Unable to verify Firebase ID token.');
  }
}
