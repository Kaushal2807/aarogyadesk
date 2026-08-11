'use client';

import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-2.5 shrink-0 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()}{' '}
          <Link href="/dashboard" className="font-bold text-slate-800 hover:text-primary-600 transition-colors">
            AarogyaDesk
          </Link>
          . All rights reserved.
        </p>
        <p className="text-xs text-slate-400 font-medium text-center sm:text-right">
          Clinical Management System
        </p>
      </div>
    </footer>
  );
}
