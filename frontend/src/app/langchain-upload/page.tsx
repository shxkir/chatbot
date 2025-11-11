'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSimpleAuth } from '@/components/SimpleAuthProvider';
import { LangChainUploader } from '@/components/LangChainUploader';

export default function LangChainUploadPage() {
  const { user, loading, signOutUser } = useSimpleAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="page-container">
      <nav className="breadcrumb">
        <Link href="/">← Home</Link>
        <button type="button" onClick={() => signOutUser()} className="logout-btn">
          Sign Out
        </button>
      </nav>

      <LangChainUploader />

      <div className="info-box">
        <h3>🔬 How it works</h3>
        <ol>
          <li>
            <strong>Upload PDF:</strong> Your PDF is sent to the backend
          </li>
          <li>
            <strong>Text Extraction:</strong> PDF text is extracted using pdf-parse
          </li>
          <li>
            <strong>Smart Chunking:</strong> Text is split using LangChain's{' '}
            <code>RecursiveCharacterTextSplitter</code>
          </li>
          <li>
            <strong>Embeddings:</strong> Each chunk is converted to vectors using OpenAI embeddings
          </li>
          <li>
            <strong>Vector Storage:</strong> Vectors are stored in Pinecone with namespace{' '}
            <code>pdf_&lt;timestamp&gt;</code>
          </li>
          <li>
            <strong>Ready to Chat:</strong> Ask questions and get AI-powered answers based on your
            document!
          </li>
        </ol>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .breadcrumb {
          max-width: 600px;
          margin: 0 auto 2rem auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .breadcrumb a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .breadcrumb a:hover {
          opacity: 1;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .info-box {
          max-width: 600px;
          margin: 3rem auto 0 auto;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        .info-box h3 {
          margin: 0 0 1rem 0;
          color: #111728;
        }
        .info-box ol {
          margin: 0;
          padding-left: 1.5rem;
          line-height: 1.8;
          color: #334155;
        }
        .info-box li {
          margin-bottom: 0.75rem;
        }
        .info-box code {
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #1e293b;
        }
      `}</style>
    </main>
  );
}
