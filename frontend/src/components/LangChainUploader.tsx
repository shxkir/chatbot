'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { uploadPdfWithLangChain } from '@/lib/langchainApi';

export function LangChainUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setBusy(true);
    setStatus('Processing PDF with LangChain (RecursiveCharacterTextSplitter + Cohere embeddings)...');
    try {
      const result = await uploadPdfWithLangChain(file);
      window.localStorage.setItem('langchain-namespace', result.namespace);
      setStatus(
        `✅ Success! Processed with LangChain:\n- Namespace: ${result.namespace}\n- Chunks: ${result.chunksIndexed}\n\nRedirecting to chat...`,
      );
      setTimeout(() => {
        router.push(`/langchain-chat?namespace=${result.namespace}`);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setStatus(`❌ Error: ${message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="uploader-container">
      <div className="header">
        <h2>📄 LangChain PDF RAG</h2>
        <p className="subtitle">
          <strong>Upload a PDF to create embeddings with Cohere</strong>
        </p>
      </div>

      <label className="dropzone">
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={busy}
        />
        <div className="dropzone-content">
          <span className="icon">📎</span>
          <span className="text">{file ? file.name : 'Click to select a PDF'}</span>
          {file && <span className="size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>}
        </div>
      </label>

      <button type="button" onClick={handleUpload} disabled={!file || busy} className="upload-btn">
        {busy ? '⏳ Processing...' : '🚀 Upload & Process with LangChain'}
      </button>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
          <pre>{status}</pre>
        </div>
      )}

      <style jsx>{`
        .uploader-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .header h2 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          color: #111728;
        }
        .subtitle {
          color: #64748b;
          font-size: 0.95rem;
        }
        .dropzone {
          display: block;
          border: 3px dashed #cbd5f5;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
          cursor: pointer;
          background: #f8fafc;
          transition: all 0.2s;
        }
        .dropzone:hover {
          border-color: #111728;
          background: #f1f5f9;
        }
        .dropzone input {
          display: none;
        }
        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .icon {
          font-size: 3rem;
        }
        .text {
          color: #475569;
          font-size: 1.1rem;
        }
        .size {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .upload-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #111728 0%, #1e293b 100%);
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .upload-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 12px;
          background: #f1f5f9;
          border-left: 4px solid #64748b;
        }
        .status.success {
          background: #f0fdf4;
          border-left-color: #22c55e;
        }
        .status.error {
          background: #fef2f2;
          border-left-color: #ef4444;
        }
        .status pre {
          margin: 0;
          font-family: inherit;
          white-space: pre-wrap;
          color: #334155;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
