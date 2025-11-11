'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from './AuthProvider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p>Checking credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}
