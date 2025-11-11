'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { uploadPdf } from '@/lib/backendApi';

export function FileUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setBusy(true);
    setStatus('Uploading PDF to backend, extracting text, generating embeddings, and storing in Pinecone...');
    try {
      const result = await uploadPdf(file);
      window.localStorage.setItem('active-doc-id', result.docId);
      window.localStorage.setItem('active-namespace', result.namespace);
      setStatus(`Success! Indexed ${result.chunksIndexed} chunks. Redirecting to chat...`);
      setTimeout(() => {
        router.push(`/chat?namespace=${result.namespace}`);
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setStatus(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="dropzone">
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={busy}
        />
        <span>{file ? file.name : 'Select a PDF to upload'}</span>
      </label>
      <button type="button" onClick={handleUpload} disabled={!file || busy}>
        {busy ? 'Processing...' : 'Upload & Process'}
      </button>
      {status && <p className="status">{status}</p>}
      <style jsx>{`
        .dropzone {
          display: block;
          border: 2px dashed #cbd5f5;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          text-align: center;
          cursor: pointer;
          color: #475569;
          background: #f8fafc;
        }
        .dropzone input {
          display: none;
        }
        button {
          width: 100%;
          padding: 0.9rem;
          border-radius: 12px;
          border: none;
          background: #111728;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }
        .status {
          margin-top: 0.75rem;
          color: #ea580c;
        }
      `}</style>
    </div>
  );
}
