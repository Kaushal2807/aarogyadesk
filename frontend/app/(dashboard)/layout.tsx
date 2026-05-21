import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import DashboardSessionGuard from '@/components/providers/DashboardSessionGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSessionGuard>
      <div className="flex flex-col min-h-screen relative z-[1]">
        <AppHeader />
        <main className="flex-1 relative z-[1]">{children}</main>
        <AppFooter />
      </div>
    </DashboardSessionGuard>
  );
}
