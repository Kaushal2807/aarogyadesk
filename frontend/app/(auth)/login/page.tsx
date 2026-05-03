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
      className="w-full max-w-[520px] bg-white p-8 sm:p-12 rounded-2xl shadow-lg shadow-black/[0.08]"
      style={{ animation: 'fadeInUp 0.6s ease forwards' }}
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-[#003D7A]">Aarogyas</span>
          <span className="text-[#2E8B57]">desk</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Secure Login Portal
        </p>
      </div>

      {/* Login Form */}
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

      {/* Logo at bottom of card */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
        <Image
          src="/logo.png"
          alt="Aarogyasdesk"
          width={80}
          height={80}
          className="opacity-70 hover:opacity-100 transition-opacity duration-300"
          priority
        />
      </div>
    </div>
  );
}
