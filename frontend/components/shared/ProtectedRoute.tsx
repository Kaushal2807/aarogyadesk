'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const token = auth.getToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const user = auth.getCurrentUser();
    if (requiredRole && user?.user_type !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [router, requiredRole]);

  return <>{children}</>;
}
