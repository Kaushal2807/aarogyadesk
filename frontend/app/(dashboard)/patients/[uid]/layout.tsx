'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { patientService } from '@/lib/services/patients';
import PatientHeader from '@/components/patients/PatientHeader';
import PatientTabs from '@/components/patients/PatientTabs';
import EmptyState from '@/components/ui/EmptyState';
import { Patient } from '@/types';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const uid = params.uid as string;
  const isPrintPage = pathname.includes('/print');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await patientService.getByUid(uid);
        setPatient(data);
      } catch {
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3">Loading patient...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <EmptyState message={`Patient "${uid}" not found`} />
      </div>
    );
  }

  return (
    <div className={isPrintPage ? '' : 'h-full overflow-y-auto'}>
      <div className={isPrintPage ? '' : 'max-w-7xl mx-auto px-4 mt-6 mb-4'}>
        {!isPrintPage && <PatientHeader patient={patient} />}
        {!isPrintPage && <PatientTabs uid={uid} />}
        {children}
      </div>
    </div>
  );
}
