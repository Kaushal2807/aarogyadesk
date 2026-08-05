'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiUser, BiClipboard, BiSolidPencil, BiCheckCircle } from 'react-icons/bi';

interface PatientTabsProps {
  uid: string;
}

const tabs = [
  { href: '/history', label: 'History', icon: BiUser },
  { href: '/prescriptions', label: 'Prescriptions', icon: BiClipboard },
  { href: '/treatments', label: 'Treatments', icon: BiSolidPencil },
  { href: '/work-done', label: 'Work Done', icon: BiCheckCircle },
];

export default function PatientTabs({ uid }: PatientTabsProps) {
  const pathname = usePathname();
  const basePath = `/patients/${uid}`;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const href = `${basePath}${tab.href}`;
        // Ensure accurate matching even if the URL has encoded spaces
        const isActive = decodeURIComponent(pathname) === decodeURIComponent(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-gradient text-white shadow-btn-primary'
                : 'bg-white text-slate-600 hover:bg-slate-50 shadow-card'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
