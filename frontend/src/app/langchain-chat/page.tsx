'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { LangChainChat } from '@/components/LangChainChat';
import { useLangChainChat } from '@/hooks/useLangChainChat';

export default function LangChainChatPage() {
  const params = useSearchParams();
  const queryNamespace = params.get('namespace');
  const [namespace, setNamespace] = useState<string | null>(null);
  const { messages, sendMessage, busy, error, references } = useLangChainChat(namespace);

  useEffect(() => {
    if (queryNamespace) {
      setNamespace(queryNamespace);
      window.localStorage.setItem('langchain-namespace', queryNamespace);
      return;
    }
    const stored = window.localStorage.getItem('langchain-namespace');
    if (stored) {
      setNamespace(stored);
    }
  }, [queryNamespace]);

  return (
    <main className="page-container">
      <nav className="breadcrumb">
        <Link href="/langchain-upload">← Upload Another PDF</Link>
      </nav>

      <section className="chat-panel">
        {error && <div className="error-banner">⚠️ {error}</div>}
        <div className="chat-container">
          <LangChainChat
            messages={messages}
            references={references}
            onSend={sendMessage}
            busy={busy}
            namespace={namespace}
          />
        </div>
      </section>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .breadcrumb {
          max-width: 960px;
          margin: 0 auto 1rem auto;
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
        .chat-panel {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }
        .error-banner {
          background: #fef2f2;
          border: 2px solid #ef4444;
          color: #991b1b;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .chat-container {
          height: 600px;
        }
      `}</style>
    </main>
  );
}
