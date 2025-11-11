'use client';

import Link from 'next/link';

import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';

export function Landing() {
  const { user, signOutUser } = useAuth();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: 32,
          padding: '2.5rem',
          boxShadow: '0 30px 80px rgba(15,23,42,0.15)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Firebase RAG Chatbot</h1>
        <p style={{ color: '#475569' }}>
          Upload PDFs, embed them with OpenAI, store vectors in Pinecone, and chat with your docs. Auth is powered by
          Firebase.
        </p>

        {user ? (
          <>
            <p style={{ marginTop: '1rem' }}>Signed in as {user.email ?? user.uid}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/upload" className="primary-btn">
                Go to Uploads
              </Link>
              <button type="button" onClick={() => signOutUser()} className="secondary-btn">
                Sign out
              </button>
            </div>
          </>
        ) : (
          <LoginForm />
        )}
      </section>
      <style jsx>{`
        .primary-btn,
        .secondary-btn {
          padding: 0.85rem 1.4rem;
          border-radius: 999px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-align: center;
        }
        .primary-btn {
          background: #111728;
          color: #fff;
        }
        .secondary-btn {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
    </main>
  );
}
