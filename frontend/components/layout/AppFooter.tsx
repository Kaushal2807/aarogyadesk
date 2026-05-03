import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/60 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()}{' '}
          <Link href="/dashboard" className="hover:text-[#003D7A] transition-colors">
            <span className="text-[#003D7A] font-medium">Aarogyas</span>
            <span className="text-[#2E8B57] font-medium">desk</span>
          </Link>
          . All rights reserved.
        </p>
        <p className="text-xs text-slate-400">
          Clinical Management System
        </p>
      </div>
    </footer>
  );
}
