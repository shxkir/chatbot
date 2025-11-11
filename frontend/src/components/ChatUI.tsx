'use client';

import { FormEvent, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
  busy: boolean;
};

export function ChatUI({ messages, onSend, busy }: Props) {
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
      <div className="messages" aria-live="polite">
        {messages.length === 0 && <p className="placeholder">Ask your first question about the document.</p>}
        {messages.map((message, idx) => (
          <div key={`message-${idx}`} className={`message ${message.role}`}>
            <div className="label">{message.role === 'user' ? 'You' : 'Bot'}</div>
            <div className="bubble">{message.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="composer">
        <input
          type="text"
          placeholder="Ask something about your PDF..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>
          {busy ? 'Thinking...' : 'Send'}
        </button>
      </form>
      <style jsx>{`
        .chat-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1rem;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          background: #fff;
        }
        .message {
          margin-bottom: 1rem;
        }
        .message .label {
          font-size: 0.8rem;
          color: #475569;
          margin-bottom: 0.2rem;
        }
        .message .bubble {
          padding: 0.9rem 1.1rem;
          border-radius: 12px;
          background: #f1f5f9;
          color: #0f172a;
          white-space: pre-wrap;
        }
        .message.user .bubble {
          background: #111728;
          color: white;
        }
        .composer {
          display: flex;
          gap: 0.75rem;
        }
        .composer input {
          flex: 1;
          padding: 0.85rem 1rem;
          border-radius: 999px;
          border: 1px solid #cbd5f5;
          font-size: 1rem;
        }
        .composer button {
          border: none;
          border-radius: 999px;
          padding: 0 1.5rem;
          background: #111728;
          color: #fff;
          font-size: 1rem;
        }
        .placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
