'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function DashboardSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Verify authentication on mount
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Set up session check interval (every minute)
    const checkInterval = setInterval(() => {
      if (!auth.isAuthenticated()) {
        router.push('/login');
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(checkInterval);
    };
  }, [router]);

  return <>{children}</>;
}
