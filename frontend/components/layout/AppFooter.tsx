'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';

export default function AppFooter() {
  const [clinicName, setClinicName] = useState<string>('');

  useEffect(() => {
    const user = auth.getCurrentUser();
    
    if (user) {
      import('@/lib/api').then(({ default: apiClient }) => {
        apiClient.get('/clinics/me')
          .then(res => {
            const data = res.data?.data || res.data;
            if (data && data.clinic_name) {
              setClinicName(data.clinic_name);
            } else if (user.clinic_id) {
              apiClient.get(`/clinics/${user.clinic_id}`)
                .then(r => {
                  const rData = r.data?.data || r.data;
                  if (rData && rData.clinic_name) setClinicName(rData.clinic_name);
                }).catch(() => {});
            }
          })
          .catch(() => {
            if (user.clinic_id) {
              apiClient.get(`/clinics/${user.clinic_id}`)
                .then(r => {
                  const rData = r.data?.data || r.data;
                  if (rData && rData.clinic_name) setClinicName(rData.clinic_name);
                }).catch(() => {});
            }
          });
      });
    }
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200/60 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()}{' '}
          <Link href="/dashboard" className="hover:text-[#003D7A] transition-colors">
            {clinicName ? (
              <span className="text-slate-800 font-bold">{clinicName}</span>
            ) : (
              <>
                <span className="text-[#003D7A] font-medium">Aarogyas</span>
                <span className="text-[#2E8B57] font-medium">desk</span>
              </>
            )}
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
