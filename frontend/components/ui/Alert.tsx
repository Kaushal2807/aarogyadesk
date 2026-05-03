'use client';

import { useEffect } from 'react';

interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

const typeClasses: Record<string, string> = {
  success: 'bg-emerald-100 border-l-emerald-500 text-emerald-800',
  danger: 'bg-red-100 border-l-red-500 text-red-800',
  warning: 'bg-amber-100 border-l-amber-500 text-amber-800',
  info: 'bg-blue-100 border-l-blue-500 text-blue-800',
};

export default function Alert({ type, message, onClose, autoClose = true }: AlertProps) {
  useEffect(() => {
    if (!autoClose || !onClose) return undefined;
    const timer = setTimeout(onClose, 3500);
    return () => { clearTimeout(timer); };
  }, [autoClose, onClose]);

  return (
    <div className={`border-l-4 rounded-xl p-3 mb-4 text-sm animate-[slideInRight_0.4s_ease] ${typeClasses[type]} relative`}>
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-60 hover:opacity-100">&times;</button>
      )}
      {message}
    </div>
  );
}
