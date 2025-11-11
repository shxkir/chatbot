'use client';

import { useCallback, useState } from 'react';

import { queryChat } from '@/lib/backendApi';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function useChat(namespace: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [references, setReferences] = useState<
    Array<{ rank: number; score?: number; textPreview: string }>
  >([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!namespace) {
        setError('Upload a PDF first.');
        return;
      }
      setBusy(true);
      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      try {
        const response = await queryChat(text, namespace);
        const reply = response.reply || 'No response';
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        setReferences(response.references ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Chat request failed.';
        setError(message);
      } finally {
        setBusy(false);
      }
    },
    [namespace],
  );

  return { messages, sendMessage, busy, error, references };
}
