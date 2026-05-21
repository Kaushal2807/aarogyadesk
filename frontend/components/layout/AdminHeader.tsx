'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { BiHome, BiUserPlus, BiCreditCard, BiSupport, BiLogOut } from 'react-icons/bi';
import { auth } from '@/lib/auth';

const adminLinks = [
  { href: '/admin', label: 'Home', icon: <BiHome className="w-4 h-4" /> },
  { href: '/admin/users', label: 'Add User', icon: <BiUserPlus className="w-4 h-4" /> },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: <BiCreditCard className="w-4 h-4" /> },
  { href: '/admin/support', label: 'Support', icon: <BiSupport className="w-4 h-4" /> },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-primary-600">Admin Panel</span>
          <nav className="hidden md:flex items-center gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all text-sm ${
                  pathname === link.href
                    ? 'bg-primary-hover-gradient'
                    : 'bg-primary-gradient hover:bg-primary-hover-gradient'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-2 rounded-lg transition-all text-sm">
            <BiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t border-slate-100 py-2 flex flex-wrap gap-1">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              pathname === link.href ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
            }`}>
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
