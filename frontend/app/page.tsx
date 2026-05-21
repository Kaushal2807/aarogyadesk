'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (auth.isAuthenticated()) {
      const user = auth.getCurrentUser();
      if (user?.user_type === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Otherwise redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[#003D7A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

