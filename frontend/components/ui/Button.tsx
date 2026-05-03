'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'outline-primary' | 'outline-success' | 'outline-secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-gradient text-white shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5',
  success: 'bg-success-gradient text-white shadow-md hover:-translate-y-0.5',
  danger: 'bg-danger-gradient text-white shadow-md hover:-translate-y-0.5',
  'outline-primary': 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
  'outline-success': 'border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white',
  'outline-secondary': 'border-2 border-slate-300 text-slate-500 hover:bg-slate-500 hover:text-white',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
