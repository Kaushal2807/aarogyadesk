'use client';

import { useState } from 'react';
import { BiShow, BiHide, BiLock } from 'react-icons/bi';
import { InputHTMLAttributes } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, id, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-2">
        {label}
      </label>
      <div className="relative">
        <BiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full py-2.5 text-sm border-2 rounded-[10px] bg-white transition-all duration-300 focus:outline-none placeholder:text-slate-400 ${error ? 'border-red-400 focus:ring-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-slate-200 focus:border-[#003D7A] focus:shadow-[0_0_0_3px_rgba(0,61,122,0.1)]'}`}
          style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003D7A] transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <BiHide className="w-4 h-4" /> : <BiShow className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
