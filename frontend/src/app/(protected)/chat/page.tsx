'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ChatUI } from '@/components/ChatUI';
import { useAuth } from '@/components/AuthProvider';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const params = useSearchParams();
  const queryNamespace = params.get('namespace');
  const [namespace, setNamespace] = useState<string | null>(null);
  const { signOutUser } = useAuth();
  const { messages, sendMessage, busy, error, references } = useChat(namespace);

  useEffect(() => {
    if (queryNamespace) {
      setNamespace(queryNamespace);
      window.localStorage.setItem('active-namespace', queryNamespace);
      return;
    }
    const stored = window.localStorage.getItem('active-namespace');
    if (stored) {
      setNamespace(stored);
    }
  }, [queryNamespace]);

  return (
    <main className="chat-page">
      <section className="chat-panel">
        <header>
          <div>
            <p className="eyebrow">Document Namespace</p>
            <h1>{namespace ?? 'Upload a PDF to begin'}</h1>
          </div>
          <div className="cta">
            <button type="button" onClick={() => signOutUser()}>
              Sign out
            </button>
          </div>
        </header>
        {error && <p className="error">{error}</p>}
        <div className="chat-container">
          <ChatUI messages={messages} onSend={sendMessage} busy={busy} />
        </div>
        {references.length > 0 && (
          <div className="references">
            <h3>References</h3>
            <ul>
              {references.map((ref) => (
                <li key={ref.rank}>
                  <strong>#{ref.rank}</strong> score {ref.score?.toFixed(3) ?? 'n/a'} – {ref.textPreview}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <style jsx>{`
        .chat-page {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          justify-content: center;
        }
        .chat-panel {
          width: 100%;
          max-width: 960px;
          background: #fff;
          border-radius: 32px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cta button {
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 999px;
          background: #e2e8f0;
          cursor: pointer;
        }
        .chat-container {
          height: 500px;
        }
        .references {
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
        }
        .references ul {
          margin: 0;
          padding-left: 1rem;
          color: #475569;
        }
        .error {
          color: #dc2626;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
