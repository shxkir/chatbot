'use client';

import { FormEvent, useState } from 'react';

import { useAuth } from './AuthProvider';

export function LoginForm() {
  const { emailSignIn, emailSignUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await emailSignIn(email, password);
      } else {
        await emailSignUp(email, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to authenticate.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button type="button" className="secondary" onClick={() => signInWithGoogle()} disabled={busy}>
        Continue with Google
      </button>
      <p style={{ marginTop: '0.75rem' }}>
        {mode === 'signin' ? (
          <>
            Need an account?{' '}
            <button type="button" onClick={() => setMode('signup')}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('signin')}>
              Sign in
            </button>
          </>
        )}
      </p>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <style jsx>{`
        form label {
          display: grid;
          gap: 0.25rem;
          color: #475569;
          font-weight: 600;
        }
        input {
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid #cbd5f5;
          font-size: 1rem;
        }
        button {
          padding: 0.85rem 1rem;
          border-radius: 999px;
          border: none;
          background: #111728;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        button.secondary {
          margin-top: 0.75rem;
          width: 100%;
          background: #e5e7eb;
          color: #0f172a;
        }
        p button {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
