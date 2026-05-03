'use client';

import { useState, FormEvent } from 'react';
import PasswordInput from '@/components/forms/PasswordInput';
import { BiEnvelope } from 'react-icons/bi';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, loading = false, error = null }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Alert */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
          style={{ animation: 'fadeIn 0.3s ease forwards' }}
        >
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-600 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <BiEnvelope className="w-4 h-4 text-slate-400" />
          </div>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full py-2.5 pl-10 pr-4 text-sm border-2 border-slate-200 rounded-[10px] bg-white transition-all duration-300 focus:outline-none focus:border-[#003D7A] focus:shadow-[0_0_0_3px_rgba(0,61,122,0.1)] placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Enter your email address"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password Input */}
      <PasswordInput
        id="login-password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        placeholder="Enter your password"
        required
        autoComplete="current-password"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#003D7A] to-[#2E8B57] hover:from-[#003366] hover:to-[#247a4b] focus:outline-none focus:ring-2 focus:ring-[#003D7A]/30 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}
