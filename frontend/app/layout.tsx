import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import MedicalBackground from '@/components/layout/MedicalBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aarogyadesk - Clinical Management System',
  description: 'Modern clinical management system for dental clinics',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MedicalBackground />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { animation: 'slideInRight 0.3s ease forwards' },
              error: { style: { animation: 'slideInRight 0.3s ease forwards' } },
              success: { style: { animation: 'slideInRight 0.3s ease forwards' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
