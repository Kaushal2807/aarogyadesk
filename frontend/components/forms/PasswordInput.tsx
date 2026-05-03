'use client';

import { useState } from 'react';
import { BiShow, BiHide } from 'react-icons/bi';
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
      <div className="flex">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`flex-1 py-2.5 px-3.5 text-sm border-2 rounded-l-[10px] bg-white transition-all duration-300 focus:outline-none border-r-0 ${
            error ? 'border-red-400' : 'border-slate-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="px-3.5 py-2.5 border-2 border-l-0 border-slate-200 rounded-r-[10px] text-slate-500 hover:text-primary-500 hover:border-primary-300 hover:bg-slate-50 transition-all"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <BiHide className="w-4 h-4" /> : <BiShow className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
