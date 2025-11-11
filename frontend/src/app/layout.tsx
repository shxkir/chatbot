import type { Metadata } from 'next';

import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Firebase RAG Chatbot',
  description: 'PDF RAG chatbot powered by Firebase Auth, Cloud Functions, Pinecone, and OpenAI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
