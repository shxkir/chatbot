'use client';

import { useCallback, useState } from 'react';

import { queryWithLangChain, LangChainQueryResponse } from '@/lib/langchainApi';

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

export function useLangChainChat(namespace: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!namespace) {
        setError('Please upload a PDF first.');
        return;
      }

      setBusy(true);
      setError(null);
      setMessages((prev: Message[]) => [...prev, { role: 'user', content: text }]);

      try {
        const response: LangChainQueryResponse = await queryWithLangChain(text, namespace);
        const reply = response.reply || 'No response';
        setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: reply }]);
        setReferences(response.references ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Query failed.';
        setError(message);
        setMessages((prev: Message[]) => [
          ...prev,
          { role: 'assistant', content: `Error: ${message}` },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [namespace],
  );

  return { messages, sendMessage, busy, error, references };
}
