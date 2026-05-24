'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import { auth, User } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRedirectPath = (user: User | null) => {
    if (user?.user_type === 'admin') return '/admin';
    return '/dashboard';
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push(getRedirectPath(auth.getCurrentUser()));
    }
  }, [router]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await auth.login(email, password);
      router.push(getRedirectPath(data.user));
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-[520px] bg-white border-2 border-indigo-100 p-4 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      style={{ animation: 'fadeInUp 0.6s ease forwards' }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-1">
        <Image
          src="/logo.png"
          alt="Aarogyasdesk"
          width={200}
          height={200}
          className="drop-shadow-md"
          priority
        />
      </div>

      {/* Login Form */}
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}
