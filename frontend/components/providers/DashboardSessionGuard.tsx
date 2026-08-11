'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function DashboardSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verify authentication on mount
    if (!auth.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    // Auth is valid — allow rendering
    setIsChecking(false);

    // Set up session check interval (every minute)
    const checkInterval = setInterval(() => {
      if (!auth.isAuthenticated()) {
        router.replace('/login');
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(checkInterval);
    };
  }, [router]);

  // Show nothing while checking auth to prevent content flash
  if (isChecking) return null;

  return <>{children}</>;
}
