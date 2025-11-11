import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { storage } from './firebase/client';

export async function uploadPdfToStorage(file: File, ownerId: string) {
  const timestamp = Date.now();
  const storagePath = `uploads/${ownerId}/${timestamp}-${file.name}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      undefined,
      (error) => reject(error),
      () => resolve(),
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);
  return { storagePath, downloadUrl };
}
