'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';
import { BiMenu, BiX, BiLogOut, BiUser, BiCalendar, BiBarChart, BiWallet, BiCapsule, BiFile, BiHelpCircle } from 'react-icons/bi';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: <BiBarChart className="w-4 h-4" /> },
  { href: '/appointments', label: 'Appointments', icon: <BiCalendar className="w-4 h-4" /> },
  { href: '/reports', label: 'Reports', icon: <BiBarChart className="w-4 h-4" /> },
  { href: '/expenses', label: 'Expenses', icon: <BiWallet className="w-4 h-4" /> },
  { href: '/medicine', label: 'Medicine', icon: <BiCapsule className="w-4 h-4" /> },
];

const templateLinks = [
  { href: '/templates/certificates', label: 'Certificate Template' },
  { href: '/templates/cases', label: 'Case Template' },
];

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const user = auth.getCurrentUser();

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <Image src="/favicon.png" alt="Aarogyasdesk" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold hidden sm:inline">
              <span className="text-[#003D7A]">Aarogyas</span>
              <span className="text-[#2E8B57]">desk</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(link.href)
                    ? 'bg-primary-gradient text-white shadow-btn-primary'
                    : 'text-slate-600 hover:text-[#003D7A] hover:bg-slate-100'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Templates Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowTemplates(true)}
              onMouseLeave={() => setShowTemplates(false)}
            >
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  pathname.startsWith('/templates')
                    ? 'bg-primary-gradient text-white shadow-btn-primary'
                    : 'text-slate-600 hover:text-[#003D7A] hover:bg-slate-100'
                }`}
              >
                <BiFile className="w-4 h-4" />
                Templates
              </button>
              {showTemplates && (
                <div className="absolute top-full left-0 pt-1 w-52">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-[dropdownFadeIn_0.2s_ease]">
                    {templateLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setShowTemplates(false)}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/support"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive('/support')
                  ? 'bg-primary-gradient text-white shadow-btn-primary'
                  : 'text-slate-600 hover:text-[#003D7A] hover:bg-slate-100'
              }`}
            >
              <BiHelpCircle className="w-4 h-4" />
              Support
            </Link>
          </nav>

          {/* User Info + Logout (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BiUser className="w-4 h-4" />
              <span>{user?.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <BiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <BiX className="w-5 h-5" /> : <BiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-200/60 mt-2 pt-3 animate-[dropdownFadeIn_0.2s_ease]">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href) ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <Link href="/templates/certificates" onClick={closeMobile} className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors pl-9">
                Certificate Template
              </Link>
              <Link href="/templates/cases" onClick={closeMobile} className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors pl-9">
                Case Template
              </Link>
              <Link
                href="/support"
                onClick={closeMobile}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/support') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BiHelpCircle className="w-4 h-4" />
                Support
              </Link>
            </nav>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
                <BiUser className="w-4 h-4" />
                <span>{user?.name || 'User'}</span>
              </div>
              <button
                onClick={() => { handleLogout(); closeMobile(); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <BiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
