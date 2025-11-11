'use client';

import Link from 'next/link';

import { useSimpleAuth } from './SimpleAuthProvider';
import { SimpleLoginForm } from './SimpleLoginForm';

export function Landing() {
  const { user, signOutUser } = useSimpleAuth();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: 24,
          padding: '2.5rem',
          boxShadow: '0 30px 80px rgba(15,23,42,0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ marginTop: 0, fontSize: '2rem', color: '#111728' }}>PDF RAG Chatbot</h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Upload PDFs, create vector embeddings with Cohere, and chat with your documents using RAG
          </p>
        </div>

        {user ? (
          <>
            <div
              style={{
                background: '#f1f5f9',
                padding: '1.25rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#111728' }}>
                Welcome back, {user.fullName}!
              </p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                @{user.username} • {user.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/langchain-upload" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="primary-btn" style={{ width: '100%' }}>
                  Upload PDF
                </button>
              </Link>
              <button type="button" onClick={() => signOutUser()} className="secondary-btn">
                Sign out
              </button>
            </div>
          </>
        ) : (
          <SimpleLoginForm />
        )}
      </section>
      <style jsx>{`
        .primary-btn,
        .secondary-btn {
          padding: 0.85rem 1.4rem;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-align: center;
          font-size: 1rem;
        }
        .primary-btn {
          background: linear-gradient(135deg, #111728 0%, #1e293b 100%);
          color: #fff;
        }
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(17, 23, 40, 0.3);
        }
        .secondary-btn {
          background: #e2e8f0;
          color: #1e293b;
        }
        .secondary-btn:hover {
          background: #cbd5e1;
        }
      `}</style>
    </main>
  );
}
