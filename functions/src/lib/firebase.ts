import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

const app = initializeApp({
  credential: applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const adminAuth = getAuth(app);
