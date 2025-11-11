import Link from 'next/link';

import { FileUploader } from '@/components/FileUploader';

export default function UploadPage() {
  return (
    <main className="page">
      <section className="panel">
        <header>
          <div>
            <p className="eyebrow">Step 1</p>
            <h1>Upload a PDF</h1>
          </div>
          <Link href="/chat" className="link">
            Go to Chat
          </Link>
        </header>
        <FileUploader />
      </section>
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
        .panel {
          width: 100%;
          max-width: 720px;
          background: #fff;
          border-radius: 32px;
          padding: 2.5rem;
          box-shadow: 0 40px 90px rgba(15, 23, 42, 0.12);
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
        }
        h1 {
          margin: 0.35rem 0 0;
        }
        .link {
          font-weight: 600;
          color: #2563eb;
        }
      `}</style>
    </main>
  );
}
