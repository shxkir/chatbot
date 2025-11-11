import type { Metadata } from 'next';

import './globals.css';
import { SimpleAuthProvider } from '@/components/SimpleAuthProvider';

export const metadata: Metadata = {
  title: 'PDF RAG Chatbot',
  description: 'Upload PDFs, create vector embeddings with Cohere, store in Pinecone, and chat with your documents using RAG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SimpleAuthProvider>{children}</SimpleAuthProvider>
      </body>
    </html>
  );
}
