'use client';

import AdminHeader from '@/components/layout/AdminHeader';
import AppFooter from '@/components/layout/AppFooter';
import DashboardSessionGuard from '@/components/providers/DashboardSessionGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSessionGuard>
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </div>
    </DashboardSessionGuard>
  );
}
