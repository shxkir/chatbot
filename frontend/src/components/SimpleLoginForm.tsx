'use client';

import { FormEvent, useState } from 'react';

import { useSimpleAuth } from './SimpleAuthProvider';

export function SimpleLoginForm() {
  const { emailSignIn, emailSignUp } = useSimpleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
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
        await emailSignUp(email, password, fullName, username);
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
        {mode === 'signup' && (
          <>
            <label>
              <span>Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                minLength={2}
                placeholder="John Doe"
              />
            </label>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                minLength={3}
                placeholder="johndoe123"
              />
            </label>
          </>
        )}
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="your@email.com"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: '0.75rem', textAlign: 'center' }}>
        {mode === 'signin' ? (
          <>
            Need an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
      {error && (
        <p
          style={{
            color: '#dc2626',
            background: '#fee2e2',
            padding: '0.75rem',
            borderRadius: '8px',
            marginTop: '0.75rem',
          }}
        >
          {error}
        </p>
      )}
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
        input:focus {
          outline: none;
          border-color: #111728;
        }
        button[type='submit'] {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #111728 0%, #1e293b 100%);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        button[type='submit']:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(17, 23, 40, 0.3);
        }
        button[type='submit']:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
