'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check authentication status
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthenticated = auth.isAuthenticated();

    // Redirect unauthenticated users to login for protected routes
    if (!isPublicRoute && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Set up periodic session validity check (every 5 minutes)
    sessionCheckIntervalRef.current = setInterval(() => {
      if (!auth.isAuthenticated() && !isPublicRoute) {
        router.push('/login');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [pathname, router]);

  return <>{children}</>;
}
