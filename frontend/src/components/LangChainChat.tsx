'use client';

import { FormEvent, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Reference = {
  rank: number;
  score: number;
  textPreview: string;
  source: string;
};

type Props = {
  messages: Message[];
  references: Reference[];
  onSend: (text: string) => Promise<void>;
  busy: boolean;
  namespace: string | null;
};

export function LangChainChat({ messages, references, onSend, busy, namespace }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await onSend(trimmed);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div>
          <h2>💬 LangChain RAG Chat</h2>
          <p className="namespace">
            Namespace: <code>{namespace || 'None'}</code>
          </p>
        </div>
      </div>

      <div className="messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="placeholder">
            <p>🤖 Ask me anything about your PDF!</p>
            <p className="hint">
              I'll use similarity search to find relevant context and answer using ChatGPT.
            </p>
          </div>
        )}
        {messages.map((message, idx) => (
          <div key={`message-${idx}`} className={`message ${message.role}`}>
            <div className="label">{message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}</div>
            <div className="bubble">{message.content}</div>
          </div>
        ))}
        {busy && (
          <div className="message assistant">
            <div className="label">🤖 AI Assistant</div>
            <div className="bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {references.length > 0 && (
        <div className="references">
          <h3>📚 References Used</h3>
          <div className="references-list">
            {references.map((ref) => (
              <div key={ref.rank} className="reference-item">
                <div className="reference-header">
                  <span className="rank">#{ref.rank}</span>
                  <span className="score">Relevance: {(ref.score * 100).toFixed(1)}%</span>
                </div>
                <div className="reference-text">{ref.textPreview}...</div>
                <div className="reference-source">Source: {ref.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="composer">
        <input
          type="text"
          placeholder="Ask a question about your PDF..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>
          {busy ? '⏳' : '📤'} Send
        </button>
      </form>

      <style jsx>{`
        .chat-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1rem;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .chat-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #111728;
        }
        .namespace {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }
        .namespace code {
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.8rem;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          background: #fff;
          min-height: 400px;
        }
        .placeholder {
          text-align: center;
          color: #94a3b8;
          padding: 3rem 1rem;
        }
        .placeholder p {
          margin: 0.5rem 0;
        }
        .placeholder .hint {
          font-size: 0.9rem;
        }
        .message {
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message .label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .message .bubble {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          background: #f1f5f9;
          color: #0f172a;
          white-space: pre-wrap;
          line-height: 1.6;
        }
        .message.user .bubble {
          background: linear-gradient(135deg, #111728 0%, #1e293b 100%);
          color: white;
        }
        .typing {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
        }
        .typing span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #64748b;
          animation: bounce 1.4s infinite;
        }
        .typing span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        .references {
          border-top: 2px solid #e2e8f0;
          padding-top: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }
        .references h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #111728;
        }
        .references-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .reference-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 0.9rem;
        }
        .reference-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .rank {
          font-weight: 700;
          color: #111728;
        }
        .score {
          color: #22c55e;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .reference-text {
          color: #334155;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .reference-source {
          color: #94a3b8;
          font-size: 0.8rem;
        }
        .composer {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 2px solid #e2e8f0;
        }
        .composer input {
          flex: 1;
          padding: 0.9rem 1.25rem;
          border-radius: 999px;
          border: 2px solid #cbd5f5;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .composer input:focus {
          outline: none;
          border-color: #111728;
        }
        .composer button {
          border: none;
          border-radius: 999px;
          padding: 0 2rem;
          background: linear-gradient(135deg, #111728 0%, #1e293b 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .composer button:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .composer button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
